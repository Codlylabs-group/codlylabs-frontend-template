import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { useI18n } from '../i18n'
import Footer from '../components/landing/Footer'

export default function ContactPage() {
  const { language } = useI18n()
  const es = language === 'es'

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const subject = encodeURIComponent(form.subject || (es ? 'Consulta desde el sitio' : 'Website inquiry'))
    const body = encodeURIComponent(
      `${es ? 'Nombre' : 'Name'}: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
    )
    window.location.href = `mailto:contact@codlylabs.ai?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-500/10 shadow-sm shadow-indigo-500/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-28 pb-20 px-6 max-w-2xl mx-auto w-full">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {es ? 'Contactanos' : 'Contact Us'}
          </h1>
          <p className="text-gray-500 leading-relaxed">
            {es
              ? 'Completá el formulario y te responderemos a la brevedad.'
              : 'Fill out the form and we\'ll get back to you shortly.'}
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {es ? 'Tu cliente de email se abrió' : 'Your email client opened'}
            </h2>
            <p className="text-gray-500 text-sm">
              {es
                ? 'Enviá el email desde tu cliente para completar el contacto. Te responderemos en 24-48 horas hábiles.'
                : 'Send the email from your client to complete the contact. We\'ll reply within 24-48 business hours.'}
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              {es ? 'Enviar otro mensaje' : 'Send another message'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {es ? 'Nombre' : 'Name'} *
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder={es ? 'Tu nombre' : 'Your name'}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                {es ? 'Asunto' : 'Subject'}
              </label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder={es ? 'Ej: Consulta sobre plan Enterprise' : 'E.g. Enterprise plan inquiry'}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                {es ? 'Mensaje' : 'Message'} *
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                placeholder={es ? 'Contanos cómo podemos ayudarte...' : 'Tell us how we can help...'}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {es ? 'Enviar mensaje' : 'Send message'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {es
                ? 'Se abrirá tu cliente de email con el mensaje pre-cargado.'
                : 'Your email client will open with the message pre-filled.'}
            </p>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}
