'use client'

import { useState, useEffect } from 'react'
import Editor from './Editor'
import { supabase } from './lib/supabase'

interface Chapter {
  id: string
  title: string
  content: string
}

interface Domain {
  id: string
  name: string
  icon: string
  description: string
  themeColor: string
  chapters: Chapter[]
  fontClass: string
  bgClass?: string
  editorClass?: string
}

const INITIAL_DOMAINS: Domain[] = [
  {
    id: 'chimie',
    name: 'CHIMIE ANCIENNE & ALCHIMIE',
    icon: '⚗️',
    description: 'Thermodynamique, cinétique réactionnelle, transmutations et liaisons moléculaires.',
    themeColor: '#78350f', // Ambre / Bronze vieilli
    fontClass: 'font-serif', // Typographie encyclopédique
    bgClass: 'bg-[#1c1917]', // Fond Pierre / Cuir sombre
    editorClass: 'border-4 border-double border-amber-700/80 bg-[#faf8f5] text-stone-900 shadow-[0_10px_35px_rgba(120,53,15,0.35)]',
    chapters: [
      { id: 'ch-1', title: 'I. Des Éléments & Transmutations', content: '<h1>I. Principes fondamentaux</h1><p>De la séparation du Phlogistique et des lois de la distillation...</p>' },
      { id: 'ch-2', title: 'II. Analyse des Sels & Essences', content: '<h1>II. Vitesse de réaction</h1><p>Lois d\'Arrhenius, catalyseurs et réactions en milieu acide...</p>' }
    ]
  },
  {
    id: 'physique',
    name: 'PHYSIQUE',
    icon: '⚛️',
    description: 'Mécanique , relativité restreinte et électromagnétisme.',
    themeColor: '#31103f', // Violet Profond / Cyber
    fontClass: 'font-mono', // Typographie Matrice / Code
    bgClass: 'bg-[#0f051d]', // Fond Espace Néant
    editorClass: 'border-2 border-cyan-500/80 bg-[#160b29] text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.25)]',
    chapters: [
      { id: 'ph-1', title: 'Mécanique Quantique', content: '<h1>I. Équation de Schrödinger</h1><p>Fonctions d\'onde et postulats de la mécanique quantique...</p>' },
      { id: 'ph-2', title: 'Electromagnétisme', content: '<h1>II. Équations de Maxwell</h1><p>Champ électrique, induction et propagation des ondes...</p>' }
    ]
  },
  {
    id: 'maths',
    name: 'MATHÉMATIQUES',
    icon: '📐',
    description: 'Analyse réelle et complexe, algèbre linéaire et topologie.',
    themeColor: '#4a0404', // Bordeau Académique
    fontClass: 'font-serif',
    bgClass: 'bg-[#180303]', // Fond Sombre
    editorClass: 'border-4 border-amber-600/90 bg-[#fffdfa] text-stone-900 shadow-2xl',
    chapters: [
      { id: 'm-1', title: 'Analyse Avancée', content: '<h1>I. Intégrales multiples</h1><p>Théorèmes de Fubini et Green-Riemann...</p>' }
    ]
  },
  {
    id: 'biologie',
    name: 'BIOLOGIE',
    icon: '🧬',
    description: 'Génétique moléculaire, biochimie cellulaire et physiologie.',
    themeColor: '#062c12', // Vert Forêt Organique
    fontClass: 'font-sans', // Typographie Épurée Moderne
    bgClass: 'bg-[#021407]', // Fond Laboratoire
    editorClass: 'border-2 border-emerald-500/80 bg-[#092011] text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    chapters: [
      { id: 'bio-1', title: 'Génétique Moléculaire', content: '<h1>I. Réplication de l\'ADN</h1><p>Mécanismes enzymatiques et complexes de réplication...</p>' }
    ]
  },
]

export default function Home() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Chargement des données avec Timeout de sécurité et Fallback local
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        // Promesse de timeout de 2.5 secondes pour éviter le blocage indéfini
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Délai dépassé pour la réponse Supabase")), 2500)
        )

        const queryPromise = supabase
          .from('documents')
          .select('content')
          .eq('id', 1)
          .single()

        // Course entre la réponse DB et le timeout
        const { data, error }: any = await Promise.race([queryPromise, timeoutPromise])

        if (error) throw error

        if (data && data.content && isMounted) {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content
          setDomains(parsed)
        } else if (isMounted) {
          setDomains(INITIAL_DOMAINS)
        }
      } catch (err) {
        console.warn("Connexion Supabase non établie ou lente, chargement du corpus local :", err)
        if (isMounted) {
          setDomains(INITIAL_DOMAINS)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const activeDomain = domains.find(d => d.id === selectedDomainId)
  const activeChapter = activeDomain?.chapters.find(c => c.id === selectedChapterId)

  const handleContentChange = (newHtml: string) => {
    setDomains(prev =>
      prev.map(d => {
        if (d.id === selectedDomainId) {
          return {
            ...d,
            chapters: d.chapters.map(c =>
              c.id === selectedChapterId ? { ...c, content: newHtml } : c
            )
          }
        }
        return d
      })
    )
  }

  const handleAddChapter = () => {
    if (!selectedDomainId) return
    const title = window.prompt("Nom du nouveau chapitre :")
    if (!title) return
    const newChap: Chapter = {
      id: `chap-${Date.now()}`,
      title: title,
      content: `<h1>${title}</h1><p>Rédigez le contenu scientifique ici...</p>`
    }
    setDomains(prev => prev.map(d => {
      if (d.id === selectedDomainId) {
        return { ...d, chapters: [...d.chapters, newChap] }
      }
      return d
    }))
    setSelectedChapterId(newChap.id)
  }

  const handleGlobalSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('documents')
        .upsert({ id: 1, content: JSON.stringify(domains) })

      if (error) alert("Erreur : " + error.message)
      else alert("Sauvegarde globale effectuée avec succès dans la base de données !")
    } catch (err: any) {
      alert("Erreur de sauvegarde : " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white font-mono">
        Chargement du corpus scientifique...
      </div>
    )
  }

  // =========================================================================
  // VUE 1 : SOMMAIRE / HUB PRINCIPAL (selectedDomainId === null)
  // =========================================================================
  if (selectedDomainId === null) {
    return (
      <div className="min-h-screen bg-[#10141e] text-white font-mono p-8 select-none">
        <header className="flex justify-between items-center mb-12 border-b-2 border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-black text-yellow-400">INDEX GÉNÉRAL DES DISCIPLINES</h1>
            <p className="text-slate-400 text-xs mt-1">Sélectionnez un domaine scientifique pour accéder à son environnement.</p>
          </div>
          <button
            onClick={handleGlobalSave}
            disabled={isSaving}
            className="px-4 py-2 bg-yellow-400 text-black font-black border-2 border-white hover:bg-yellow-300 transition-colors text-xs"
          >
            {isSaving ? 'ENREGISTREMENT...' : '💾 ENREGISTRER DB'}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {domains.map(domain => (
            <div
              key={domain.id}
              onClick={() => {
                setSelectedDomainId(domain.id)
                if (domain.chapters.length > 0) {
                  setSelectedChapterId(domain.chapters[0].id)
                }
              }}
              style={{ borderColor: domain.themeColor }}
              className="bg-[#1e2430] border-2 p-6 rounded-none hover:translate-y-[-4px] transition-transform cursor-pointer flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{domain.icon}</span>
                  <h2 className="text-xl font-bold text-white tracking-wide">{domain.name}</h2>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-4">{domain.description}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-700 text-xs">
                <span className="text-slate-400">{domain.chapters.length} Chapitres enregistrés</span>
                <span style={{ color: domain.themeColor }} className="font-bold brightness-150">ACCÉDER À L'ESPACE &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // =========================================================================
  // VUE 2 : ESPACE DU DOMAINE SÉLECTIONNÉ (DYNAMIQUE)
  // =========================================================================
  return (
    <div 
      className={`flex h-screen p-2 text-xs select-none overflow-hidden transition-all duration-500 ${activeDomain?.bgClass || 'bg-slate-900'} ${activeDomain?.fontClass || 'font-mono'}`}
    >
      {/* Sidebar - Panneau de Navigation */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur border border-slate-700/60 flex flex-col mr-2 shadow-2xl rounded">
        {/* En-tête Sidebar personnalisé avec themeColor */}
        <div 
          style={{ backgroundColor: activeDomain?.themeColor }}
          className="text-white font-bold p-2.5 flex justify-between items-center text-[11px] shadow transition-colors duration-300"
        >
          <span>{activeDomain?.icon} {activeDomain?.name}</span>
          <button 
            onClick={() => {
              setSelectedDomainId(null)
              setSelectedChapterId(null)
            }}
            className="bg-black/40 text-white px-2 py-0.5 rounded text-[10px] hover:bg-black/70 transition-colors"
          >
            [SOMMAIRE]
          </button>
        </div>

        <div className="p-2 border-b border-slate-800">
          <button
            onClick={handleAddChapter}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-1.5 px-2 border border-slate-600/50 rounded transition-colors text-xs"
          >
            [+] AJOUTER CHAPITRE
          </button>
        </div>

        {/* Liste des Chapitres */}
        <div className="p-1 space-y-1 overflow-y-auto flex-1 bg-slate-950/40 m-2 border border-slate-800 rounded">
          {activeDomain?.chapters.map(chap => (
            <button
              key={chap.id}
              onClick={() => setSelectedChapterId(chap.id)}
              className={`w-full text-left p-2 text-xs truncate rounded transition-all ${
                chap.id === selectedChapterId
                  ? 'bg-amber-600/30 text-amber-200 font-bold border border-amber-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              📄 {chap.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Zone Principale de l'Éditeur */}
      <main className="flex-1 flex flex-col shadow-2xl overflow-hidden rounded border border-slate-800/80 bg-slate-950/40 backdrop-blur-sm">
        {/* Barre de Console Supérieure */}
        <div 
          style={{ backgroundColor: activeDomain?.themeColor }}
          className="text-white font-bold p-2 px-3 flex justify-between items-center text-xs shadow transition-colors duration-300"
        >
          <span>CONSOLE // [{activeDomain?.name}] -&gt; [{activeChapter?.title || 'Aucun chapitre'}]</span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGlobalSave}
              disabled={isSaving}
              className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors"
            >
              {isSaving ? 'SAUVEGARDE...' : '💾 SAUVEGARDER'}
            </button>

            <button
              onClick={() => setIsEditable(!isEditable)}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                isEditable ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-700 text-white'
              }`}
            >
              {isEditable ? '🔓 ÉDITION' : '🔒 LECTURE'}
            </button>
          </div>
        </div>

        {/* Zone de Lecture/Édition Contextuelle */}
        <div className="p-6 flex-1 overflow-y-auto flex justify-center items-start">
          <div 
            className={`w-full max-w-4xl p-8 transition-all duration-500 rounded ${activeDomain?.editorClass || 'bg-white text-black'}`}
            style={
              activeDomain?.id === 'chimie'
                ? {
                    backgroundImage: 'radial-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #fefbfc, #f5f2eb)',
                    backgroundSize: '20px 20px, 100% 100%'
                  }
                : {}
            }
          >
            {activeChapter ? (
              <Editor
                key={`${selectedDomainId}-${selectedChapterId}`}
                content={activeChapter.content}
                onChange={handleContentChange}
                isEditable={isEditable}
              />
            ) : (
              <div className="text-center font-bold p-8 opacity-60">
                AUCUN CHAPITRE SÉLECTIONNÉ DANS CE DOMAINE.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}