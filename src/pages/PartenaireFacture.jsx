import { useState, useEffect, useMemo, Fragment } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import GenerateFacturePartenaire from '../components/GenerateFacturePartenaire'
import GenerateFactureGroupePartenaire from '../components/GenerateFactureGroupePartenaire'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// Cle de regroupement : on prend le premier "mot" du nom du partenaire
// (separateur = espace, casse uniformisee). AXA BOYA / AXA EDUCO / AXA ADM
// sont alors regroupes sous "AXA". Un partenaire dont le nom n'a qu'un
// seul mot forme un groupe a un seul element.
const getGroupKey = (name = '') => {
  const first = String(name).trim().split(/\s+/)[0] || ''
  return first.toUpperCase()
}

// Affichage court d'une date (jj/mm/aaaa) ; '' si absente.
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '')

// Période d'un partenaire : "première → dernière" étiquette, ou la date
// seule si les deux sont identiques, ou '-' si aucune.
const periode = (premiere, derniere) => {
  const a = fmtDate(premiere)
  const b = fmtDate(derniere)
  if (!a && !b) return '-'
  return a === b ? a : `${a} → ${b}`
}

function PartenaireFacture() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [mois, setMois] = useState('')
  const [annee, setAnnee] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedPartner, setSelectedPartner] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState('simple') // 'simple' | 'groupe'
  const [expandedGroups, setExpandedGroups] = useState({})

  // Re-fetch automatique des le changement de mois/annee. Tableau de
  // dependance vide en plus de [mois, annee] : couvre aussi le 1er
  // chargement (mois='' et annee='').
  useEffect(() => {
    const ctrl = new AbortController()
    const fetchPartners = async () => {
      setLoading(true)
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const query = new URLSearchParams()
        if (mois) query.append('mois', mois)
        if (annee) query.append('annee', annee)
        if (dateDebut) query.append('dateDebut', dateDebut)
        if (dateFin) query.append('dateFin', dateFin)
        const qs = query.toString()
        const url = `${apiUrl}/api/eti/etiquettes${qs ? '?' + qs : ''}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: ctrl.signal,
        })

        const data = await response.json()
        if (data.success) setPartners(data.data)
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
    return () => ctrl.abort()
  }, [mois, annee, dateDebut, dateFin])

  // Listes uniques pour alimenter les selects. Tous les types sont
  // listes (cliniques incluses) : permet de suivre les analyses
  // referees par les cliniques meme si elles ne sont pas facturees.
  const partnerOptions = useMemo(
    () =>
      Array.from(
        new Set(partners.map((p) => p.partenaire).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'fr')),
    [partners]
  )
  const TYPES_FIXES = ['assurance', 'ipm', 'sococim', 'clinique']
  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...TYPES_FIXES,
          ...partners.map((p) => p.typePartenaire).filter(Boolean),
        ])
      ).sort((a, b) => a.localeCompare(b, 'fr')),
    [partners]
  )

  // Application des filtres front (partenaire + type) AVANT regroupement.
  const filteredPartners = useMemo(
    () =>
      partners.filter((p) => {
        if (selectedPartner && p.partenaire !== selectedPartner) return false
        if (selectedType && p.typePartenaire !== selectedType) return false
        return true
      }),
    [partners, selectedPartner, selectedType]
  )

  // Regroupement par prefixe pour la vue "groupe". On agrege somme et
  // count, on prend le type le plus frequent du groupe pour l'affichage.
  const groupedPartners = useMemo(() => {
    const map = new Map()
    filteredPartners.forEach((p) => {
      const key = getGroupKey(p.partenaire)
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: key,
          totalSomme: 0,
          totalCount: 0,
          premiereDate: null,
          derniereDate: null,
          types: {},
          filiales: [],
        })
      }
      const g = map.get(key)
      const somme = Number(p.totalSomme) || 0
      const count = Number(p.count) || 0
      g.totalSomme += somme
      g.totalCount += count
      // Bornes de periode du groupe (min des premieres, max des dernieres).
      if (p.premiereDate) {
        const d = new Date(p.premiereDate)
        if (!g.premiereDate || d < g.premiereDate) g.premiereDate = d
      }
      if (p.derniereDate) {
        const d = new Date(p.derniereDate)
        if (!g.derniereDate || d > g.derniereDate) g.derniereDate = d
      }
      const t = p.typePartenaire || '-'
      g.types[t] = (g.types[t] || 0) + 1
      g.filiales.push(p)
    })
    // type majoritaire du groupe
    return Array.from(map.values())
      .map((g) => {
        const dominantType = Object.entries(g.types).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
        return { ...g, dominantType }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredPartners])

  const toggleGroup = (key) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Partenaires" />
      <div className="divider"></div>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="select select-bordered"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
        >
          <option value="">Mois (tous)</option>
          {[
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
          ].map((nom, idx) => (
            <option key={nom} value={idx + 1}>
              {nom}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="input input-bordered w-32"
          placeholder="Année"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
        />

        <label className="flex items-center gap-1 text-sm">
          Du
          <input
            type="date"
            className="input input-bordered"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          Au
          <input
            type="date"
            className="input input-bordered"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </label>

        <select
          className="select select-bordered"
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
        >
          <option value="">Partenaire (tous)</option>
          {partnerOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Type (tous)</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {(selectedPartner ||
          selectedType ||
          mois ||
          annee ||
          dateDebut ||
          dateFin) && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSelectedPartner('')
              setSelectedType('')
              setMois('')
              setAnnee('')
              setDateDebut('')
              setDateFin('')
            }}
          >
            Réinitialiser
          </button>
        )}

        {/* Toggle vue Simple / Groupée */}
        <div className="join ml-auto">
          <button
            className={`btn join-item ${viewMode === 'simple' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('simple')}
          >
            Vue simple
          </button>
          <button
            className={`btn join-item ${viewMode === 'groupe' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('groupe')}
          >
            Vue groupée
          </button>
        </div>
      </div>

      <div className="divider"></div>

      {loading ? (
        <div className="loading loading-spinner text-primary">
          Chargement...
        </div>
      ) : viewMode === 'simple' ? (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-bold text-lg text-base-content">Nom</th>
                <th className="font-bold text-lg text-base-content">
                  Type Partenaire
                </th>
                <th className="font-bold text-lg text-base-content">Somme</th>
                <th className="font-bold text-lg text-base-content">Facture</th>
                <th className="font-bold text-lg text-base-content">Période</th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.partenaireId}>
                  <td>{partner.partenaire}</td>
                  <td>{partner.typePartenaire}</td>
                  <td>{partner.totalSomme}</td>
                  <td>{partner.count}</td>
                  <td className="text-sm">
                    {periode(partner.premiereDate, partner.derniereDate)}
                  </td>
                  <td>
                    <GenerateFacturePartenaire
                      partner={partner}
                      mois={mois}
                      annee={annee}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-bold text-lg text-base-content w-8"></th>
                <th className="font-bold text-lg text-base-content">Groupe</th>
                <th className="font-bold text-lg text-base-content">
                  Type Partenaire
                </th>
                <th className="font-bold text-lg text-base-content">
                  Somme totale
                </th>
                <th className="font-bold text-lg text-base-content">
                  Nb factures
                </th>
                <th className="font-bold text-lg text-base-content">Période</th>
                <th className="font-bold text-lg text-base-content">Filiales</th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedPartners.map((g) => {
                const isOpen = !!expandedGroups[g.key]
                const hasMultiple = g.filiales.length > 1
                return (
                  <Fragment key={g.key}>
                    <tr
                      className={hasMultiple ? 'font-semibold bg-base-200' : ''}
                    >
                      <td>
                        {hasMultiple ? (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => toggleGroup(g.key)}
                            aria-label={isOpen ? 'Replier' : 'Déplier'}
                          >
                            {isOpen ? '▼' : '▶'}
                          </button>
                        ) : null}
                      </td>
                      <td>{g.name}</td>
                      <td>{g.dominantType}</td>
                      <td>{g.totalSomme}</td>
                      <td>{g.totalCount}</td>
                      <td className="text-sm">
                        {periode(g.premiereDate, g.derniereDate)}
                      </td>
                      <td>{g.filiales.length}</td>
                      <td>
                        {hasMultiple ? (
                          <GenerateFactureGroupePartenaire
                            group={g}
                            mois={mois}
                            annee={annee}
                          />
                        ) : (
                          <GenerateFacturePartenaire
                            partner={g.filiales[0]}
                            mois={mois}
                            annee={annee}
                          />
                        )}
                      </td>
                    </tr>
                    {hasMultiple && isOpen
                      ? g.filiales.map((p) => (
                          <tr key={p.partenaireId} className="bg-base-100">
                            <td></td>
                            <td className="pl-8">↳ {p.partenaire}</td>
                            <td>{p.typePartenaire}</td>
                            <td>{p.totalSomme}</td>
                            <td>{p.count}</td>
                            <td className="text-sm">
                              {periode(p.premiereDate, p.derniereDate)}
                            </td>
                            <td></td>
                            <td>
                              <GenerateFacturePartenaire
                                partner={p}
                                mois={mois}
                                annee={annee}
                              />
                            </td>
                          </tr>
                        ))
                      : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PartenaireFacture
