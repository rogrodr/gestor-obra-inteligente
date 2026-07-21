import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react'

import { api } from '../../services/api'
import { salvarComandoOffline } from '../../services/db'

interface VoiceAssistantProps {
  obraId?: string
  onCommandProcessed?: (result: any) => void
}

export function VoiceAssistant({
  obraId: initialObraId,
  onCommandProcessed
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [status, setStatus] = useState<
    'idle' |
    'listening' |
    'processing' |
    'success' |
    'error' |
    'offline-queued'
  >('idle')

  const [message, setMessage] = useState('')
  const [obras, setObras] = useState<any[]>([])
  const [selectedObraId, setSelectedObraId] = useState(initialObraId || '')
  const [textMode, setTextMode] = useState(false)
  const [textInput, setTextInput] = useState('')

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!initialObraId) {
      api
        .get('/obras')
        .then(res => {
          setObras(res.data)

          if (res.data.length > 0) {
            setSelectedObraId(res.data[0].id)
          }
        })
        .catch(err =>
          console.error(
            'Erro ao buscar obras:',
            err
          )
        )
    } else {
      setSelectedObraId(initialObraId)
    }
  }, [initialObraId])

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setTextMode(true)
      return
    }

    const rec = new SpeechRecognition()

    rec.continuous = false
    rec.lang = 'pt-BR'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setIsListening(true)
      setStatus('listening')
      setMessage('Estou ouvindo...')
    }

    rec.onresult = (event: any) => {
      const texto =
        event.results[0][0].transcript

      setTranscription(texto)

      processarTextoComando(texto)
    }

    rec.onerror = () => {
      setStatus('error')
      setMessage(
        'Não consegui capturar sua voz.'
      )
      setIsListening(false)
    }

    rec.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = rec
  }, [selectedObraId])

  const toggleListening = () => {
    if (!selectedObraId) {
      setStatus('error')
      setMessage(
        'Selecione uma obra primeiro.'
      )
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      try {
        setMessage('')
        setStatus('idle')
        recognitionRef.current?.start()
      } catch {
        setStatus('error')
        setMessage(
          'Falha ao iniciar microfone.'
        )
      }
    }
  }

  const processarTextoComando = async (
    texto: string
  ) => {
    if (!texto.trim()) return

    setStatus('processing')
    setMessage(
      'Processando comando com IA...'
    )

    const online = navigator.onLine

    if (!online) {
      try {
        await salvarComandoOffline(
          texto,
          selectedObraId
        )

        setStatus('offline-queued')

        setMessage(
          'Comando salvo localmente. Será enviado quando houver internet.'
        )

        setTextInput('')

        window.dispatchEvent(
          new Event('novo-comando-offline')
        )

        onCommandProcessed?.({
          sucesso: true,
          offline: true
        })
      } catch {
        setStatus('error')

        setMessage(
          'Erro ao salvar comando offline.'
        )
      }

      return
    }

    try {
      const res = await api.post(
        '/ia/comando',
        {
          texto,
          obraId: selectedObraId
        }
      )

      if (res.data?.sucesso) {
        setStatus('success')

        setMessage(
          res.data.mensagem ||
            'Comando executado com sucesso.'
        )

        setTextInput('')

        window.dispatchEvent(
          new Event('lancamento-adicionado')
        )

        onCommandProcessed?.(res.data)
      } else {
        setStatus('error')

        setMessage(
          res.data?.mensagem ||
            'Não consegui interpretar.'
        )
      }
    } catch (err: any) {
      setStatus('error')

      setMessage(
        err.response?.data?.message ||
          'Erro ao comunicar com servidor.'
      )
    }
  }

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!textInput.trim()) return

    setTranscription(textInput)

    processarTextoComando(textInput)
  }

  return (
    <div className="card-premium overflow-hidden">

      {/* HEADER */}

      <div className="p-7 md:p-8 border-b border-slate-100">

        <div className="flex items-start justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles
                size={18}
                className="text-blue-600"
              />

              <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
                Assistente Inteligente
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Comando de Voz
            </h2>

            <p className="text-slate-500 mt-2">
              Registre despesas, materiais,
              presença de equipe e etapas
              usando voz ou texto.
            </p>
          </div>

          <button
            onClick={() =>
              setTextMode(!textMode)
            }
            className="
            px-4
            h-11
            rounded-xl
            bg-slate-100
            hover:bg-slate-200
            text-sm
            font-semibold
            transition-all
            "
          >
            {textMode
              ? 'Microfone'
              : 'Digitar'}
          </button>

        </div>

      </div>

      {/* BODY */}

      <div className="p-7 md:p-8">

        {!initialObraId &&
          obras.length > 0 && (
            <div className="mb-6">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Obra
              </label>

              <select
                value={selectedObraId}
                onChange={(e) =>
                  setSelectedObraId(
                    e.target.value
                  )
                }
                className="input-premium"
              >
                {obras.map((obra) => (
                  <option
                    key={obra.id}
                    value={obra.id}
                  >
                    {obra.nome}
                  </option>
                ))}
              </select>

            </div>
          )}

        {!textMode ? (
          <div
            className="
            flex
            flex-col
            items-center
            justify-center
            py-8
            "
          >

            <button
              onClick={toggleListening}
              className={`
              w-32
              h-32

              rounded-full

              flex
              items-center
              justify-center

              transition-all

              ${
                isListening
                  ? `
                  bg-red-500
                  text-white
                  animate-pulse
                  shadow-[0_0_40px_rgba(239,68,68,0.35)]
                  `
                  : `
                  bg-blue-600
                  text-white
                  shadow-[0_20px_40px_rgba(0,102,255,0.35)]
                  hover:scale-105
                  `
              }
              `}
            >
              {isListening ? (
                <MicOff size={48} />
              ) : (
                <Mic size={48} />
              )}
            </button>

            <h3 className="mt-6 text-lg font-bold text-slate-900">
              {isListening
                ? 'Estou ouvindo...'
                : 'Toque para falar'}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Fale naturalmente.
            </p>

          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-3"
          >
            <input
              value={textInput}
              onChange={(e) =>
                setTextInput(
                  e.target.value
                )
              }
              placeholder="Ex: registrar saída de 250 reais para cimento"
              className="input-premium flex-1"
            />

            <button
              type="submit"
              className="
              btn-primary
              px-5
              flex
              items-center
              justify-center
              "
            >
              <Send size={18} />
            </button>
          </form>
        )}

        {transcription && (
          <div
            className="
            mt-6
            bg-slate-50
            border
            border-slate-200
            rounded-2xl
            p-4
            "
          >
            <div className="text-xs uppercase font-bold text-slate-400 mb-2">
              Último comando
            </div>

            <p className="text-slate-700 italic">
              "{transcription}"
            </p>
          </div>
        )}

        {status !== 'idle' && (
          <div
            className={`
            mt-6
            rounded-2xl
            p-4

            flex
            items-start
            gap-3

            ${
              status === 'success'
                ? 'bg-green-50 text-green-700'
                : status ===
                  'offline-queued'
                ? 'bg-slate-100 text-slate-700'
                : status ===
                  'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }
            `}
          >
            {status ===
              'offline-queued' && (
              <WifiOff size={18} />
            )}

            {status ===
              'success' && (
              <CheckCircle2 size={18} />
            )}

            {(status === 'error' ||
              status ===
                'processing' ||
              status ===
                'listening') && (
              <AlertCircle size={18} />
            )}

            <span>{message}</span>
          </div>
        )}

        <div
          className="
          mt-6

          rounded-2xl

          bg-blue-50

          border
          border-blue-100

          p-5
          "
        >
          <h4 className="font-bold text-blue-900 mb-3">
            Exemplos rápidos
          </h4>

          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Registrar saída de 150 reais
              para ferramentas
            </p>

            <p>
              Comprar 20 sacos de cimento
            </p>

            <p>
              Carlos e João trabalharam
              hoje
            </p>

            <p>
              Alterar etapa para
              alvenaria
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}