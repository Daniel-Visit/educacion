"use client";
import Link from "next/link";
import { BookOpen, Sparkles, FileText, Edit3, CheckSquare, MessageSquare, ArrowRight, Users, Brain, Zap } from "lucide-react";

export default function Home() {
  const sections = [
    {
      title: "Entrevista Pedagógica",
      description: "Comienza una conversación inteligente con tu tutora virtual para explorar tus necesidades educativas",
      icon: MessageSquare,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      href: "/entrevista",
      features: ["IA Conversacional", "Análisis Personalizado", "Recomendaciones"],
      isPrimary: true
    },
    {
      title: "Evaluaciones",
      description: "Crea y gestiona evaluaciones basadas en matrices de especificación con preguntas inteligentes",
      icon: CheckSquare,
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200",
      href: "/evaluaciones",
      features: ["Matrices de Especificación", "Preguntas Automáticas", "Respuestas Correctas"]
    },
    {
      title: "Matrices de Especificación",
      description: "Diseña matrices detalladas que guíen la creación de evaluaciones alineadas con objetivos de aprendizaje",
      icon: FileText,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      href: "/matrices",
      features: ["Objetivos de Aprendizaje", "Criterios de Evaluación", "Especificaciones Detalladas"]
    },
    {
      title: "Editor de Planificaciones",
      description: "Crea planificaciones de clase y materiales de apoyo con un editor avanzado y herramientas de IA",
      icon: Edit3,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      href: "/editor",
      features: ["Editor TipTap", "Generación con IA", "Materiales de Apoyo"]
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            ¡Hola, Francisca! 
          </h1>
          <p className="text-gray-600 text-base">
            Tu plataforma educativa inteligente está lista para ayudarte
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 rounded-full border border-indigo-200">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-700">IA Pedagógica Activa</span>
        </div>
      </div>
      
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {sections.map((section, index) => (
          <Link key={index} href={section.href} className="group">
            <div className={`
              relative h-full bg-gradient-to-br ${section.bgGradient} border ${section.borderColor} 
              rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] 
              hover:border-opacity-60 cursor-pointer overflow-hidden
              ${section.isPrimary ? 'ring-2 ring-emerald-200 ring-opacity-50' : ''}
            `}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full blur-2xl"></div>
                <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full blur-xl"></div>
              </div>
              
            
              {/* Header */}
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${section.gradient} rounded-xl shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon size={20} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {section.title}
                    </h2>
                    {section.isPrimary && (
                      <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                        <Sparkles size={10} /> Destacado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.description}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 ${section.isPrimary ? 'text-emerald-500' : ''}`} />
              </div>
              
              {/* Features */}
              <div className="relative z-10">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {section.features.map((feature, featureIndex) => (
                    <span key={featureIndex} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/70 backdrop-blur-sm text-gray-700 border border-white/50">
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* CTA Button */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${section.gradient} text-white rounded-lg font-medium text-xs shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  {section.isPrimary ? (
                    <>
                      <Sparkles size={12} />
                      Comenzar Ahora
                    </>
                  ) : (
                    <>
                      Explorar
                      <ArrowRight size={12} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Brain size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">IA Pedagógica</h3>
          <p className="text-gray-600 text-xs">Asistencia inteligente para tu práctica docente</p>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Users size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Enfoque Personalizado</h3>
          <p className="text-gray-600 text-xs">Adaptado a tus necesidades específicas</p>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Zap size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Herramientas Avanzadas</h3>
          <p className="text-gray-600 text-xs">Editor profesional y generación con IA</p>
        </div>
      </div>
    </>
  );
}
