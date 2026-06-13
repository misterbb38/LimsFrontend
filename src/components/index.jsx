import { useState, useEffect, useMemo } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faVial,
  faUsers,
  faMoneyBillWave,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faCalendarDay,
  faCalendarWeek,
  faArrowUp,
  faArrowDown,
  faFlask,
  faVenusMars,
} from '@fortawesome/free-solid-svg-icons'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

const fmt = (n) =>
  Math.round(Number(n) || 0).toLocaleString('fr-FR') + ' CFA'
const num = (n) => Number(n) || 0
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const startOfWeek = (d) => {
  const x = new Date(d)
  const day = x.getDay() // 0 = dimanche
  const diff = (day + 6) % 7 // lundi = 0
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - diff)
  return x
}

const HomeContent = () => {
  const [analyses, setAnalyses] = useState([])
  const [patientStats, setPatientStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}

  useEffect(() => {
    const ctrl = new AbortController()
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        const token = userInfo?.token
        const [analyseRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/api/analyse`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctrl.signal,
          }),
          fetch(`${apiUrl}/api/user/patient-stats`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctrl.signal,
          }),
        ])
        const aJson = await analyseRes.json()
        const sJson = await statsRes.json()
        if (aJson.success) setAnalyses(aJson.data || [])
        setPatientStats(sJson)
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    return () => ctrl.abort()
  }, [])

  // === Calculs ===
  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = startOfWeek(now)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const previousWeekStart = new Date(weekStart)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)

    const todayList = []
    const yesterdayList = []
    const weekList = []
    const previousWeekList = []

    let caJour = 0,
      caSemaine = 0,
      encaisseJour = 0,
      impayeTotal = 0,
      reliquatTotal = 0

    const testsAujourdhui = new Set()
    const patientsJour = new Set()
    const patientsSemaine = new Set()

    let validees = 0
    let aValider = 0
    let enCours = 0

    analyses.forEach((a) => {
      if (!a.createdAt) return
      const d = new Date(a.createdAt)
      // Aujourd'hui
      if (isSameDay(d, now)) {
        todayList.push(a)
        caJour += num(a.prixTotal)
        if (a.statusPayement === 'Payée') encaisseJour += num(a.prixTotal)
        else if (a.statusPayement === 'Reliquat')
          encaisseJour += num(a.prixTotal) - num(a.reliquat)
        if (a.userId?._id) patientsJour.add(String(a.userId._id))
        if (Array.isArray(a.tests))
          a.tests.forEach((t) => testsAujourdhui.add(t._id || t))
      }
      // Hier
      if (isSameDay(d, yesterdayStart)) yesterdayList.push(a)
      // Semaine en cours
      if (d >= weekStart) {
        weekList.push(a)
        caSemaine += num(a.prixTotal)
        if (a.userId?._id) patientsSemaine.add(String(a.userId._id))
      }
      // Semaine precedente
      if (d >= previousWeekStart && d < weekStart) previousWeekList.push(a)

      // Statut global
      if (a.statusPayement === 'Payée') validees++
      else if (a.statusPayement === 'Reliquat') enCours++
      else aValider++

      // Impayes (global)
      if (a.statusPayement === 'Impayée') impayeTotal += num(a.prixTotal)
      if (a.statusPayement === 'Reliquat') reliquatTotal += num(a.reliquat)
    })

    // Variation J vs J-1
    const variationJour =
      yesterdayList.length === 0
        ? null
        : todayList.length - yesterdayList.length
    const variationSemaine =
      previousWeekList.length === 0
        ? null
        : weekList.length - previousWeekList.length

    // 7 derniers jours pour le chart
    const sept = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - i)
      const items = analyses.filter(
        (a) => a.createdAt && isSameDay(new Date(a.createdAt), d)
      )
      sept.push({
        jour: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        analyses: items.length,
        ca: items.reduce((s, a) => s + num(a.prixTotal), 0),
      })
    }

    // Top tests semaine
    const testCount = new Map()
    weekList.forEach((a) => {
      ;(a.tests || []).forEach((t) => {
        const nom = t?.nom || t?._id || '?'
        testCount.set(nom, (testCount.get(nom) || 0) + 1)
      })
    })
    const topTests = Array.from(testCount.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Dernieres analyses (10)
    const recentes = [...analyses]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)

    return {
      caJour,
      caSemaine,
      encaisseJour,
      impayeTotal,
      reliquatTotal,
      nbJour: todayList.length,
      nbSemaine: weekList.length,
      nbPatientsJour: patientsJour.size,
      nbPatientsSemaine: patientsSemaine.size,
      nbTestsJour: testsAujourdhui.size,
      variationJour,
      variationSemaine,
      sept,
      topTests,
      validees,
      aValider,
      enCours,
      recentes,
    }
  }, [analyses])

  // Verification du role
  if (
    !['superadmin', 'medecin', 'technicien', 'preleveur', 'docteur'].includes(
      userInfo?.userType
    )
  ) {
    return (
      <div role="alert" className="alert alert-warning m-4">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>Vous n&apos;avez pas le droit d&apos;accéder à cette page.</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error m-4">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>{error}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const COLORS_STATUT = ['#10b981', '#f59e0b', '#ef4444']
  const dataStatut = [
    { name: 'Validées', value: stats.validees },
    { name: 'Reliquat', value: stats.enCours },
    { name: 'En attente', value: stats.aValider },
  ]
  const dataSexe = patientStats
    ? [
        { name: 'Hommes', value: num(patientStats.maleCount) },
        { name: 'Femmes', value: num(patientStats.femaleCount) },
        { name: 'Enfants', value: num(patientStats.minorsCount) },
      ]
    : []

  return (
    <div className="bg-base-100 p-4 md:p-6 min-h-screen">
      <NavigationBreadcrumb pageName="Accueil" />

      {/* Header bienvenue */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-2xl p-6 shadow-lg mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Bonjour {userInfo?.nom || ''} {userInfo?.prenom || ''}
        </h1>
        <p className="opacity-90 mt-1 capitalize">{today}</p>
      </div>

      {/* === KPIs PRINCIPAUX === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BigKpi
          icon={faCalendarDay}
          label="Analyses aujourd'hui"
          value={stats.nbJour}
          variation={stats.variationJour}
          color="from-sky-500 to-cyan-500"
        />
        <BigKpi
          icon={faCalendarWeek}
          label="Analyses cette semaine"
          value={stats.nbSemaine}
          variation={stats.variationSemaine}
          color="from-violet-500 to-fuchsia-500"
        />
        <BigKpi
          icon={faMoneyBillWave}
          label="CA aujourd'hui"
          value={fmt(stats.caJour)}
          color="from-emerald-500 to-teal-500"
          isMoney
        />
        <BigKpi
          icon={faMoneyBillWave}
          label="CA cette semaine"
          value={fmt(stats.caSemaine)}
          color="from-amber-500 to-orange-500"
          isMoney
        />
      </div>

      {/* === KPIs SECONDAIRES === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniKpi
          icon={faUsers}
          label="Patients du jour"
          value={stats.nbPatientsJour}
        />
        <MiniKpi
          icon={faUsers}
          label="Patients semaine"
          value={stats.nbPatientsSemaine}
        />
        <MiniKpi
          icon={faVial}
          label="Tests effectués"
          value={stats.nbTestsJour}
          hint="différents aujourd'hui"
        />
        <MiniKpi
          icon={faCheckCircle}
          label="Encaissé jour"
          value={fmt(stats.encaisseJour)}
        />
      </div>

      {/* === GRAPHIQUES === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Activité des 7 derniers jours" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.sept}>
              <defs>
                <linearGradient id="areaCa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaNb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="jour" style={{ fontSize: 11 }} />
              <YAxis style={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="analyses"
                name="Analyses"
                stroke="#0ea5e9"
                fill="url(#areaNb)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="ca"
                name="CA (CFA)"
                stroke="#10b981"
                fill="url(#areaCa)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Statut des analyses">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={dataStatut}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                label={(e) => `${e.value}`}
              >
                {dataStatut.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS_STATUT[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Top 5 tests cette semaine" icon={faFlask}>
          {stats.topTests.length === 0 ? (
            <div className="text-sm opacity-50 py-8 text-center">
              Aucune analyse cette semaine
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={stats.topTests}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="nom"
                  width={140}
                  style={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#a855f7"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Répartition patients" icon={faVenusMars}>
          {dataSexe.length === 0 ? (
            <div className="text-sm opacity-50 py-8 text-center">
              Pas de données patients
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={dataSexe}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={(e) => `${e.value}`}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ec4899" />
                  <Cell fill="#facc15" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Synthèse financière" icon={faMoneyBillWave}>
          <div className="space-y-3 mt-2">
            <FinanceLine
              label="Impayé global"
              value={fmt(stats.impayeTotal)}
              color="text-error"
            />
            <FinanceLine
              label="Reliquat global"
              value={fmt(stats.reliquatTotal)}
              color="text-warning"
            />
            <FinanceLine
              label="CA semaine"
              value={fmt(stats.caSemaine)}
              color="text-success"
            />
            <FinanceLine
              label="Ticket moyen jour"
              value={fmt(
                stats.nbJour ? stats.caJour / stats.nbJour : 0
              )}
              color="text-info"
            />
          </div>
        </Card>
      </div>

      {/* === ACTIVITE RECENTE === */}
      <Card title="Dernières analyses" icon={faClock}>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Identifiant</th>
                <th>Patient</th>
                <th>Partenaire</th>
                <th className="text-right">Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentes.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center opacity-50">
                    Aucune analyse
                  </td>
                </tr>
              )}
              {stats.recentes.map((a) => (
                <tr key={a._id}>
                  <td className="text-sm">
                    {new Date(a.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="font-mono text-xs">{a.identifiant}</td>
                  <td>
                    {a.userId?.nom} {a.userId?.prenom}
                  </td>
                  <td className="text-sm">{a.partenaireId?.nom || '-'}</td>
                  <td className="text-right">{fmt(a.prixTotal)}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        a.statusPayement === 'Payée'
                          ? 'badge-success'
                          : a.statusPayement === 'Reliquat'
                            ? 'badge-warning'
                            : 'badge-error'
                      }`}
                    >
                      {a.statusPayement}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// === Sous-composants ===

function BigKpi({ icon, label, value, variation, color, isMoney }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <FontAwesomeIcon icon={icon} className="text-3xl opacity-80" />
        {variation != null && (
          <div
            className={`text-xs font-bold px-2 py-1 rounded-full bg-white/20`}
          >
            <FontAwesomeIcon
              icon={variation >= 0 ? faArrowUp : faArrowDown}
              className="mr-1"
            />
            {variation >= 0 ? '+' : ''}
            {variation}
          </div>
        )}
      </div>
      <div className={`mt-3 font-bold ${isMoney ? 'text-xl' : 'text-3xl'}`}>
        {value}
      </div>
      <div className="text-sm opacity-90 mt-1">{label}</div>
    </div>
  )
}

function MiniKpi({ icon, label, value, hint }) {
  return (
    <div className="bg-base-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
      <div className="bg-primary/10 rounded-full p-3">
        <FontAwesomeIcon icon={icon} className="text-primary text-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs opacity-70 truncate">{label}</div>
        <div className="text-lg font-bold">{value}</div>
        {hint && <div className="text-[10px] opacity-50">{hint}</div>}
      </div>
    </div>
  )
}

function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-base-200 rounded-2xl p-4 shadow-sm ${className}`}>
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        {icon && (
          <FontAwesomeIcon icon={icon} className="text-primary text-sm" />
        )}
        {title}
      </h3>
      {children}
    </div>
  )
}

function FinanceLine({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-base-300">
      <span className="text-sm opacity-70">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  )
}

export default HomeContent
