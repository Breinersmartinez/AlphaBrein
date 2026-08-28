import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  MessageSquare,
  Bot,
  Zap,
  Scale,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
  Server,
  Clock,
  Star,
  Github,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Globe,
  Building2,
  Headphones,
  BarChart3,
  KeyRound,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Seguridad', href: '#seguridad' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  {
    icon: Lock,
    title: 'Autenticación Segura',
    description:
      'Gestiona cuentas con cifrado BCrypt (salt rounds 10) y sesiones stateless mediante JWT con expiración de 24 horas.',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Bot,
    title: 'Chat con IA',
    description:
      'Asistente conversacional con integración n8n, contexto persistente por sesión y respuestas especializadas en tiempo real.',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad Enterprise',
    description:
      'Control de acceso por roles (ADMIN/USER), políticas de autorización por endpoint y monitoreo continuo de la plataforma.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Scale,
    title: 'Asesoría Legal',
    description:
      'Soluciones jurídicas especializadas con base legal colombiana (Ley 50 de 1990, Código Sustantivo del Trabajo, entre otras).',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    icon: Server,
    title: 'Infraestructura Escalable',
    description:
      'Arquitectura de 3 capas desplegada en Kubernetes con auto-escalado horizontal, health checks y despliegues blue-green.',
    accent: 'from-sky-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Observabilidad',
    description:
      'Métricas de la plataforma con Prometheus, dashboards de Grafana y monitoreo de rendimiento de base de datos.',
    accent: 'from-rose-500 to-pink-500',
  },
];

const STEPS = [
  {
    icon: KeyRound,
    step: '01',
    title: 'Crea tu cuenta',
    description:
      'Regístrate con tu cédula, correo y contraseña. Tu información se cifra con BCrypt de forma inmediata.',
  },
  {
    icon: MessageSquare,
    step: '02',
    title: 'Inicia una conversación',
    description:
      'Abre una sesión de chat segura con autenticación JWT y empieza a consultar con el asistente.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Recibe respuestas expertas',
    description:
      'El agente IA procesa tu consulta con contexto conversacional y entrega una respuesta fundamentada.',
  },
];

const PRICING_PLANS = [
  {
    name: 'Básico',
    price: '$0',
    period: '/mes',
    description: 'Para usuarios que inician.',
    features: [
      '1 sesión de chat activa',
      'Respuestas con IA estándar',
      'Historial de 30 días',
      'Soporte por email',
    ],
    highlighted: false,
    cta: 'Comenzar gratis',
  },
  {
    name: 'Profesional',
    price: '$49',
    period: '/mes',
    description: 'Para uso profesional frecuente.',
    features: [
      'Chat ilimitado',
      'IA con contexto avanzado',
      'Historial ilimitado',
      'Soporte prioritario 24/7',
      'Exportación de conversaciones',
    ],
    highlighted: true,
    cta: 'Empezar prueba 14 días',
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    period: '',
    description: 'Para organizaciones y equipos.',
    features: [
      'Despliegue on-premise',
      'SSO y control de roles',
      'SLA garantizado 99.9%',
      'Gerente de cuenta dedicado',
      'Integraciones personalizadas',
    ],
    highlighted: false,
    cta: 'Contactar ventas',
  },
];

const FAQ_ITEMS = [
  {
    question: '¿Cómo protege AlphaBrein mis contraseñas?',
    answer:
      'Tus contraseñas se almacenan exclusivamente con hash BCrypt (strength 10), un algoritmo adaptativo con salt aleatorio. Nunca guardamos texto plano y la comparación se realiza en el servidor.',
  },
  {
    question: '¿Qué tecnología usa el asistente de chat?',
    answer:
      'El chat se integra con workflows de n8n que orquestan modelos de lenguaje (LLM) con recuperación aumentada (RAG) sobre una base de conocimiento legal.',
  },
  {
    question: '¿La plataforma está disponible on-premise?',
    answer:
      'Sí. Contamos con despliegues en Kubernetes con imágenes Docker listas para producción, incluidos el monitoreo con Prometheus y Grafana.',
  },
  {
    question: '¿Cuánto tiempo se conserva el historial de conversaciones?',
    answer:
      'Las conversaciones persisten de forma segura en PostgreSQL y permanecen disponibles en tu panel. El plan Enterprise incluye políticas de retención personalizables.',
  },
  {
    question: '¿Puedo integrar AlphaBrein con mis sistemas?',
    answer:
      'Exponemos una API REST documentada con OpenAPI/Swagger, ideal para integraciones corporativas, y disponemos de webhooks para automatizar flujos de negocio.',
  },
];

const TESTIMONIALS = [
  {
    name: 'María Fernanda Rojas',
    role: 'Directora Jurídica, Firma Legal XYZ',
    quote:
      'Redujo drásticamente el tiempo de consulta legal de nuestros clientes. La precisión y el fundamento de las respuestas superan nuestras expectativas.',
    initials: 'MR',
  },
  {
    name: 'Carlos Andrés Mejía',
    role: 'CTO, Grupo Empresarial ABC',
    quote:
      'La seguridad de la plataforma es de nivel enterprise. La integración con nuestro pipeline de CI/CD y Kubernetes fue impecable.',
    initials: 'CM',
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-16">
      <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-400 uppercase">
        <Sparkles size={16} />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">{title}</h2>
      {description && (
        <p className="mt-4 text-lg text-slate-400">{description}</p>
      )}
    </div>
  );
}

function Navbar({ navigateTo, onMenuToggle, isMenuOpen }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group" aria-label="AlphaBrein inicio">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Alpha<span className="text-blue-400">Brein</span>
              </span>
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigateTo('login')}
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigateTo('clientSignUp')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition shadow-lg shadow-blue-600/25"
            >
              Crear cuenta
              <ArrowRight size={16} />
            </button>
          </div>

          <button
            className="lg:hidden p-2 text-slate-300 hover:text-white"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={onMenuToggle}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => { onMenuToggle(); navigateTo('login'); }}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { onMenuToggle(); navigateTo('clientSignUp'); }}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-blue-300 border border-blue-600/40 hover:bg-blue-600/10 transition"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero({ navigateTo }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-sm text-blue-300 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              Plataforma enterprise de asesoría con IA
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Asesoría legal inteligente,
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                segura y a escala
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-xl">
              AlphaBrein combina autenticación de nivel enterprise (JWT + BCrypt), un
              asistente conversacional con IA y una infraestructura en Kubernetes para
              brindar respuestas jurídicas precisas y protegidas.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigateTo('clientSignUp')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xl shadow-blue-600/30"
              >
                Comenzar ahora
                <ArrowRight size={18} />
              </button>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition"
              >
                Ver cómo funciona
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-800 pt-8">
              {[
                { value: '99.9%', label: 'Disponibilidad' },
                { value: '<200ms', label: 'Respuesta AI' },
                { value: '24/7', label: 'Monitoreo' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <ChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  const messages = [
    { sender: 'USER', text: '¿Cuáles son mis derechos laborales en caso de despido injustificado?' },
    { sender: 'AGENT', text: 'Según la Ley 50 de 1990, tiene derecho a indemnización equivalente a 30 días de salario por el primer año trabajado. ¿Desea detalle adicional?' },
    { sender: 'USER', text: '¿Y si llevo 3 años en la empresa?' },
    { sender: 'AGENT', text: 'Para 3 años le corresponden 90 días de salario. Puedo generarle una estimación exacta si comparte su salario mensual.' },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-2xl rounded-3xl" />
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-3 flex items-center gap-2 text-sm text-slate-300">
            <Bot size={16} className="text-blue-400" />
            AlphaBrein Assistant
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En línea
          </span>
        </div>

        <div className="p-5 space-y-4 max-h-[420px] overflow-hidden">
          {messages.map((msg, i) =>
            msg.sender === 'USER' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] bg-blue-600 text-white text-sm rounded-2xl rounded-br-md px-4 py-3 shadow-lg shadow-blue-600/20">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="max-w-[80%] bg-slate-800 text-slate-200 text-sm rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
                  {msg.text}
                </div>
              </div>
            )
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
            <MessageSquare size={18} className="text-slate-400" />
            <span className="flex-1 text-sm text-slate-500">Escribe tu consulta...</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="funcionalidades" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Funcionalidades"
          title="Todo lo que necesitas, en una sola plataforma"
          description="Diseñada con estándares enterprise para ofrecer seguridad, escalabilidad y una experiencia superior."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-900/50 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="De registro a respuesta en minutos"
          description="Un flujo simple y seguro, respaldado por una arquitectura de 3 capas y autenticación JWT en cada paso."
        />
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.step} className="relative">
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-slate-700" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg">
                    <step.icon size={36} className="text-blue-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-xs">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { title: 'Cifrado BCrypt con salt aleatorio', detail: 'Hash adaptativo para tus credenciales' },
    { title: 'Tokens JWT stateless', detail: 'HMAC-SHA256 con expiración de 24 horas' },
    { title: 'Control de acceso por roles', detail: 'Autorización granular ADMIN/USER' },
    { title: 'Despliegues con verificación de integridad', detail: 'Imágenes firmadas con Cosign + SBOM' },
    { title: 'Monitoreo continuo de seguridad', detail: 'CodeQL, OWASP y escáneres de dependencias' },
  ];

  return (
    <section id="seguridad" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-400 uppercase">
              <ShieldCheck size={16} />
              Seguridad
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Seguridad de nivel enterprise en cada capa
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Protegemos tus datos desde la autenticación hasta la persistencia, con
              prácticas de seguridad verificables y auditables.
            </p>
            <ul className="mt-8 space-y-4">
              {items.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-blue-600/10 blur-2xl rounded-3xl" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Lock size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Auditoría de seguridad</p>
                    <p className="text-xs text-slate-500">Último escaneo: hace 2 horas</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                  ✓ Cumplimiento
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Dependencias backend', value: 'Pasa', status: 'ok' },
                  { label: 'Dependencias frontend', value: 'Pasa', status: 'ok' },
                  { label: 'Escaneo de contenedores', value: 'Pasa', status: 'ok' },
                  { label: 'Análisis estático (CodeQL)', value: 'Pasa', status: 'ok' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700"
                  >
                    <span className="text-sm text-slate-300">{row.label}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                      <CheckCircle2 size={15} />
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60">
                <Clock size={16} className="text-slate-400" />
                <p className="text-xs text-slate-400">
                  Próximo escaneo programado automáticamente en el pipeline de CI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 bg-slate-900/50 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonios"
          title="Confían en AlphaBrein"
          description="Organizaciones de diversos sectores optimizan sus procesos con nuestra plataforma."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ navigateTo }) {
  return (
    <section id="precios" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Precios"
          title="Planes que escalan contigo"
          description="Elige el plan que mejor se adapte a tus necesidades. Sin costos ocultos, cancela cuando quieras."
        />
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-2xl border transition ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600/15 to-slate-900 border-blue-500/50 shadow-2xl shadow-blue-600/10 lg:scale-105'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-xs font-bold text-white shadow-lg">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-500">{plan.period}</span>}
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('clientSignUp')}
                className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-24 bg-slate-900/50 border-y border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Resolvemos tus dudas"
          description="Información clara y transparente sobre la plataforma."
        />
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className={`rounded-xl border transition ${
                  isOpen ? 'border-blue-500/40 bg-slate-900' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-white">{item.question}</span>
                  <ChevronRight
                    size={20}
                    className={`text-blue-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 -mt-2 text-sm text-slate-400 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ navigateTo }) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/40 to-slate-950" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-white">
          Comienza a transformar tu asesoría legal hoy
        </h2>
        <p className="mt-6 text-lg text-slate-400">
          Únete a organizaciones que ya confían en AlphaBrein para ofrecer respuestas
          precisas, seguras y disponibles 24/7.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigateTo('clientSignUp')}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xl shadow-blue-600/30"
          >
            Crear cuenta gratuita
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigateTo('login')}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Alpha<span className="text-blue-400">Brein</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400 max-w-xs">
              Plataforma enterprise de asesoría legal con IA, autenticación segura e
              infraestructura escalable.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { icon: Github, label: 'GitHub' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Twitter, label: 'Twitter' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Producto</h3>
            <ul className="mt-4 space-y-3">
              {['Funcionalidades', 'Seguridad', 'Precios', 'Integraciones'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Empresa</h3>
            <ul className="mt-4 space-y-3">
              {['Nosotros', 'Carreras', 'Blog', 'Prensa'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recursos</h3>
            <ul className="mt-4 space-y-3">
              {['Documentación API', 'Guía de inicio', 'Estado del servicio', 'Soporte'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={15} className="shrink-0" />
                soporte@alphabrein.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="shrink-0" />
                Colombia
              </li>
              <li className="flex items-center gap-2">
                <Globe size={15} className="shrink-0" />
                Disponible 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} AlphaBrein. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition">Privacidad</a>
            <a href="#" className="hover:text-white transition">Términos</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const HomePage = ({ navigateTo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Navbar navigateTo={navigateTo} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
      <main>
        <Hero navigateTo={navigateTo} />
        <Features />
        <HowItWorks />
        <Security />
        <Testimonials />
        <Pricing navigateTo={navigateTo} />
        <FAQ />
        <FinalCTA navigateTo={navigateTo} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;