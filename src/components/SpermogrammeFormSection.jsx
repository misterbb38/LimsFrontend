import { useEffect } from 'react'
import PropTypes from 'prop-types'

// Listes deroulantes predefinies (vocabulaire labo standard).
const VISCOSITE_OPTIONS  = ['faible', 'normale', 'élevée', 'forte']
const ASPECT_OPTIONS     = ['normal', 'anormal', 'opalescent', 'hémorragique', 'jaunâtre']

// Agglutinats / Leucocytes / Hématies / Cellules rondes : 4 listes proches
// mais avec genre grammatical et nuances differentes.
const AGGLUTINATS_OPTIONS    = ['absents',  'rares', 'quelques', 'présents',  'nombreux']
const LEUCOCYTES_OPTIONS     = ['Absentes', 'Rares', 'Quelques', 'Présentes', 'Nombreuses']
const HEMATIES_OPTIONS       = ['absentes', 'rares', 'quelques', 'présentes', 'nombreuses']
const CELLULES_RONDES_OPTIONS = ['absentes', 'rares', 'quelques', 'nombreuses'] // pas de "présentes"
const MODE_PRELEV        = ['au laboratoire', 'apporté au laboratoire']
const CONCLUSION_SPG     = [
  'Normozoospermie',
  'Oligozoospermie',
  'Asthenozoospermie',
  'Teratozoospermie',
  'Oligo-Astheno-Teratozoospermie (OAT)',
  'Azoospermie',
  'Necrozoospermie',
  'Cryptozoospermie',
]
const CONCLUSION_SCG = ['Normal', 'Teratospermie', 'Borderline']

// Champs numeriques avec pattern { valeur, unite, reference }.
const NUMERIC_GENERAUX = [
  { key: 'volume', label: 'Volume',                     placeholder: 'ex: 2,5' },
  { key: 'ph',     label: 'pH',                         placeholder: 'ex: 7,8' },
]
const NUMERIC_NUMERATION = [
  { key: 'numeration',    label: 'Numeration',                 placeholder: 'ex: 79 010 000' },
  { key: 'ejaculatTotal', label: 'Ejaculat total (auto)',      placeholder: 'auto si vide' },
]
const NUMERIC_VITALITE = [
  { key: 'spermatozoidesVivants', label: 'Spermatozoides vivants', placeholder: 'ex: 61,0' },
]
const NUMERIC_MOBILITE = [
  { key: 'mobiliteProgressive',    label: 'Mobilite progressive (a 1h)', placeholder: 'ex: 34,89' },
  { key: 'mobiliteNonProgressive', label: 'Mobilite non progressive',    placeholder: 'ex: 15,24' },
  { key: 'immobiles',              label: 'Immobiles',                   placeholder: 'ex: 49,87' },
]

// Champs textuels (dropdowns).
const TEXT_FIELDS = [
  { key: 'viscosite',            label: 'Viscosité',             options: VISCOSITE_OPTIONS },
  { key: 'aspect',               label: 'Aspect',                options: ASPECT_OPTIONS },
  { key: 'agglutinatsSpontanes', label: 'Agglutinats spontanés', options: AGGLUTINATS_OPTIONS },
  { key: 'leucocytes',           label: 'Leucocytes',            options: LEUCOCYTES_OPTIONS },
  { key: 'hematies',             label: 'Hématies',              options: HEMATIES_OPTIONS },
  { key: 'cellulesRondes',       label: 'Cellules rondes',       options: CELLULES_RONDES_OPTIONS },
]

// Champs morphologiques (count + pourcentage).
const MORPHO_FIELDS = [
  { key: 'morphoNormal',       label: 'Formes normales' },
  { key: 'morphoAnormal',      label: 'Formes anormales' },
  { key: 'defautsTete',        label: 'Defauts de la tete' },
  { key: 'defautsPieceInter',  label: 'Defauts de la piece intermediaire' },
  { key: 'defautsFlagelle',    label: 'Defauts du flagelle' },
  { key: 'resteCytoplasmique', label: 'Reste cytoplasmique' },
]

/**
 * Section commune Spermogramme + Spermocytogramme.
 * - excepValues : objet etat racine de l'exception (excepValues.spermogramme)
 * - setExcepValues : setter React du parent
 *
 * NB : tous les inputs sont inlines dans le JSX. NE PAS extraire en
 * sous-composants definis a l'interieur de cette fonction : React les
 * recreerait a chaque frappe et le focus serait perdu.
 */
function SpermogrammeFormSection({ excepValues, setExcepValues }) {
  const sp = excepValues.spermogramme || {}

  // Calcul automatique en temps reel : ejaculat total = volume x numeration.
  // S'execute des que volume ou numeration changent ; ecrit la valeur dans
  // sp.ejaculatTotal.valeur (l'utilisateur peut toujours la surcharger manuellement
  // si la valeur ne correspond pas a son comptage reel).
  const volumeVal = parseFloat(String(sp.volume?.valeur ?? '').replace(',', '.'))
  const numerationVal = parseFloat(String(sp.numeration?.valeur ?? '').replace(',', '.'))
  useEffect(() => {
    if (
      Number.isFinite(volumeVal) && Number.isFinite(numerationVal) &&
      volumeVal > 0 && numerationVal > 0
    ) {
      const computed = Math.round(volumeVal * numerationVal)
      if (String(sp.ejaculatTotal?.valeur ?? '') !== String(computed)) {
        setExcepValues((prev) => ({
          ...prev,
          spermogramme: {
            ...prev.spermogramme,
            ejaculatTotal: {
              ...prev.spermogramme?.ejaculatTotal,
              valeur: computed,
            },
          },
        }))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeVal, numerationVal])

  const updateNumericField = (key, valeur) =>
    setExcepValues((prev) => ({
      ...prev,
      spermogramme: {
        ...prev.spermogramme,
        [key]: { ...prev.spermogramme?.[key], valeur },
      },
    }))

  const updateScalar = (key, value) =>
    setExcepValues((prev) => ({
      ...prev,
      spermogramme: { ...prev.spermogramme, [key]: value },
    }))

  const updateMorphoField = (key, subKey, value) =>
    setExcepValues((prev) => ({
      ...prev,
      spermogramme: {
        ...prev.spermogramme,
        [key]: { ...prev.spermogramme?.[key], [subKey]: value },
      },
    }))

  // Rendu inline d'un input numerique standard (key + label + placeholder).
  const renderNumericInput = (field) => (
    <div key={field.key} className="flex flex-col">
      <label className="label">{field.label}</label>
      <input
        type="text"
        inputMode="decimal"
        className="input input-bordered w-[180px]"
        placeholder={field.placeholder}
        value={sp[field.key]?.valeur ?? ''}
        onChange={(e) => updateNumericField(field.key, e.target.value)}
      />
      <small className="text-gray-500">
        {sp[field.key]?.unite ? `${sp[field.key].unite} | ` : ''}
        Ref : {sp[field.key]?.reference || '-'}
      </small>
    </div>
  )

  // Rendu inline d'un dropdown texte.
  const renderTextDropdown = (field) => (
    <div key={field.key} className="flex flex-col">
      <label className="label">{field.label}</label>
      <select
        className="select select-bordered w-[200px]"
        value={sp[field.key] ?? ''}
        onChange={(e) => updateScalar(field.key, e.target.value)}
      >
        <option value="">--</option>
        {field.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="border p-4 mt-4 space-y-4">
      <h3 className="font-bold text-lg">Spermogramme</h3>
      <p className="text-sm text-gray-600">
        Bilan de fertilite masculine (normes OMS). L&apos;ejaculat total est
        calcule automatiquement si Volume et Numeration sont renseignes.
      </p>

      {/* Donnees pre-analytiques */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="label">Duree d&apos;abstinence</label>
          <input
            type="text"
            inputMode="numeric"
            className="input input-bordered w-[150px]"
            placeholder="ex: 3"
            value={sp.dureeAbstinence?.valeur ?? ''}
            onChange={(e) => updateNumericField('dureeAbstinence', e.target.value)}
          />
          <small className="text-gray-500">jours | Ref : 2 - 7</small>
        </div>
        <div className="flex flex-col">
          <label className="label">Mode de prelevement</label>
          <select
            className="select select-bordered w-[220px]"
            value={sp.modePrelevement ?? ''}
            onChange={(e) => updateScalar('modePrelevement', e.target.value)}
          >
            <option value="">--</option>
            {MODE_PRELEV.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CARACTERES GENERAUX */}
      <div>
        <h4 className="font-bold mt-2">Caracteres generaux</h4>
        <div className="flex flex-wrap gap-4 items-end">
          {NUMERIC_GENERAUX.map(renderNumericInput)}
          {TEXT_FIELDS.slice(0, 2).map(renderTextDropdown)}
        </div>
      </div>

      {/* NUMERATION */}
      <div>
        <h4 className="font-bold mt-2">Numeration des spermatozoides</h4>
        <div className="flex flex-wrap gap-4 items-end">
          {NUMERIC_NUMERATION.map(renderNumericInput)}
          {TEXT_FIELDS.slice(2).map(renderTextDropdown)}
        </div>
      </div>

      {/* VITALITE */}
      <div>
        <h4 className="font-bold mt-2">Etude de la vitalite (test de Williams)</h4>
        <div className="flex flex-wrap gap-4 items-end">
          {NUMERIC_VITALITE.map(renderNumericInput)}
        </div>
      </div>

      {/* MOBILITE */}
      <div>
        <h4 className="font-bold mt-2">Etude de la mobilite</h4>
        <div className="flex flex-wrap gap-4 items-end">
          {NUMERIC_MOBILITE.map(renderNumericInput)}
        </div>
      </div>

      {/* SPERMOCYTOGRAMME */}
      <div>
        <h4 className="font-bold mt-2">Spermocytogramme (morphologie)</h4>
        <table className="table table-compact w-full">
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>%</th>
              <th>Ref</th>
            </tr>
          </thead>
          <tbody>
            {MORPHO_FIELDS.map((m) => (
              <tr key={m.key}>
                <td>{m.label}</td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input input-bordered input-sm w-[100px]"
                    value={sp[m.key]?.count ?? ''}
                    onChange={(e) => updateMorphoField(m.key, 'count', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input input-bordered input-sm w-[100px]"
                    value={sp[m.key]?.pourcentage ?? ''}
                    onChange={(e) => updateMorphoField(m.key, 'pourcentage', e.target.value)}
                  />
                </td>
                <td className="text-gray-500 text-sm">
                  {sp[m.key]?.reference || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col mt-2">
          <label className="label">Index anomalies multiples</label>
          <input
            type="text"
            inputMode="decimal"
            className="input input-bordered w-[180px]"
            placeholder="ex: 2,59"
            value={sp.indexAnomaliesMultiples?.valeur ?? ''}
            onChange={(e) => updateMorphoField('indexAnomaliesMultiples', 'valeur', e.target.value)}
          />
        </div>
      </div>

      {/* CONCLUSION */}
      <div>
        <h4 className="font-bold mt-2">Conclusion</h4>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="label">Spermogramme</label>
            <select
              className="select select-bordered w-[300px]"
              value={sp.conclusionSpermogramme ?? ''}
              onChange={(e) => updateScalar('conclusionSpermogramme', e.target.value)}
            >
              <option value="">--</option>
              {CONCLUSION_SPG.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="label">Spermocytogramme</label>
            <select
              className="select select-bordered w-[220px]"
              value={sp.conclusionSpermocytogramme ?? ''}
              onChange={(e) => updateScalar('conclusionSpermocytogramme', e.target.value)}
            >
              <option value="">--</option>
              {CONCLUSION_SCG.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

SpermogrammeFormSection.propTypes = {
  excepValues: PropTypes.object.isRequired,
  setExcepValues: PropTypes.func.isRequired,
}

export default SpermogrammeFormSection
