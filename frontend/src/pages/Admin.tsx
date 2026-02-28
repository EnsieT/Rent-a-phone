import { useState } from 'react'
import { loadCatalog, saveCatalog, resetCatalog } from '../utils/catalogStore'
import type { CatalogPhone, Tier, Condition } from '../data/catalog'
import { DEFAULT_CATALOG, TIER_LABELS, TIER_ORDER, REPO_IMAGES } from '../data/catalog'

const TIERS: Tier[] = ['budget', 'mid-tier', 'premium']
const CONDITIONS: Condition[] = ['Mint', 'Like New', 'Good', 'Fair']

function emptyPhone(): Omit<CatalogPhone, 'id'> {
  return {
    brand: '',
    model: '',
    description: '',
    tier: 'mid-tier',
    imagePath: '/assets/images/fallback.svg',
    ram: '8 GB',
    storage: '128 GB',
    condition: 'Good',
    buyPrice: 0,
    perDayPrice: 0,
    available: true,
  }
}

export default function Admin() {
  const [catalog, setCatalog] = useState<CatalogPhone[]>(() => loadCatalog())
  const [editing, setEditing] = useState<CatalogPhone | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newPhone, setNewPhone] = useState<Omit<CatalogPhone, 'id'>>(emptyPhone())
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function persist(updated: CatalogPhone[]) {
    saveCatalog(updated)
    setCatalog(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleSaveEdit() {
    if (!editing) return
    persist(catalog.map((p) => (p.id === editing.id ? editing : p)))
    setEditing(null)
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this phone from the catalog?')) return
    persist(catalog.filter((p) => p.id !== id))
  }

  function handleAdd() {
    const nextId = Math.max(0, ...catalog.map((p) => p.id)) + 1
    const phone: CatalogPhone = { id: nextId, ...newPhone }
    persist([...catalog, phone])
    setIsAdding(false)
    setNewPhone(emptyPhone())
  }

  function handleReset() {
    resetCatalog()
    setCatalog(DEFAULT_CATALOG)
    setConfirmReset(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function PhoneForm({
    values,
    onChange,
    onSave,
    onCancel,
    saveLabel,
  }: {
    values: Omit<CatalogPhone, 'id'>
    onChange: (v: Omit<CatalogPhone, 'id'>) => void
    onSave: () => void
    onCancel: () => void
    saveLabel: string
  }) {
    return (
      <div className="admin-form">
        <div className="admin-form-grid">
          <div className="form-group">
            <label>Brand</label>
            <input value={values.brand} onChange={(e) => onChange({ ...values, brand: e.target.value })} placeholder="e.g. Apple" />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input value={values.model} onChange={(e) => onChange({ ...values, model: e.target.value })} placeholder="e.g. iPhone 15 Pro" />
          </div>
          <div className="form-group">
            <label>Tier</label>
            <select value={values.tier} onChange={(e) => onChange({ ...values, tier: e.target.value as Tier })}>
              {TIERS.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Condition</label>
            <select value={values.condition} onChange={(e) => onChange({ ...values, condition: e.target.value as Condition })}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>RAM</label>
            <input value={values.ram} onChange={(e) => onChange({ ...values, ram: e.target.value })} placeholder="e.g. 8 GB" />
          </div>
          <div className="form-group">
            <label>Storage</label>
            <input value={values.storage} onChange={(e) => onChange({ ...values, storage: e.target.value })} placeholder="e.g. 128 GB" />
          </div>
          <div className="form-group">
            <label>Daily Rental Price ($)</label>
            <input type="number" min="0" step="0.01" value={values.perDayPrice} onChange={(e) => onChange({ ...values, perDayPrice: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label>Buy Price ($)</label>
            <input type="number" min="0" step="1" value={values.buyPrice} onChange={(e) => onChange({ ...values, buyPrice: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Phone Image</label>
            <select value={values.imagePath} onChange={(e) => onChange({ ...values, imagePath: e.target.value })}>
              {REPO_IMAGES.map((img) => <option key={img.path} value={img.path}>{img.label}</option>)}
            </select>
            <div className="admin-image-preview">
              <img src={values.imagePath} alt="Preview" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/images/fallback.svg' }} />
            </div>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea value={values.description} rows={2} onChange={(e) => onChange({ ...values, description: e.target.value })} placeholder="Short description..." style={{ padding: '0.625rem 0.875rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '1rem', fontFamily: 'inherit', width: '100%', resize: 'vertical' }} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>
              <input type="checkbox" checked={values.available} onChange={(e) => onChange({ ...values, available: e.target.checked })} style={{ marginRight: '0.5rem' }} />
              Available for rental
            </label>
          </div>
        </div>
        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Admin — Phone Catalog</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {saved && <span className="alert alert-success" style={{ margin: 0, padding: '0.375rem 0.875rem' }}>Saved!</span>}
            {confirmReset ? (
              <>
                <span style={{ color: 'var(--red-700)', fontSize: '0.9375rem' }}>Reset to defaults?</span>
                <button className="btn btn-danger btn-sm" onClick={handleReset}>Yes, Reset</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>Reset to Defaults</button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => { setIsAdding(true); setEditing(null) }}>
              + Add Phone
            </button>
          </div>
        </div>

        <div className="admin-info">
          <p>Changes are saved to your browser's localStorage and loaded on every visit. Use <strong>Reset to Defaults</strong> to restore the original catalog.</p>
          <p style={{ marginTop: '0.25rem' }}>To add new phone images, place SVG/PNG files in <code>frontend/public/assets/images/</code> and register them in <code>frontend/src/data/catalog.ts</code> under <code>REPO_IMAGES</code>.</p>
        </div>

        {isAdding && (
          <div className="admin-section">
            <h2 className="admin-section-title">Add New Phone</h2>
            <PhoneForm
              values={newPhone}
              onChange={setNewPhone}
              onSave={handleAdd}
              onCancel={() => { setIsAdding(false); setNewPhone(emptyPhone()) }}
              saveLabel="Add Phone"
            />
          </div>
        )}

        {TIER_ORDER.map((tier) => {
          const tierPhones = catalog.filter((p) => p.tier === tier)
          if (tierPhones.length === 0) return null
          return (
            <div key={tier} className="admin-section">
              <h2 className={`admin-section-title tier-title-${tier}`}>{TIER_LABELS[tier]}</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Phone</th>
                      <th>RAM</th>
                      <th>Storage</th>
                      <th>Condition</th>
                      <th>$/day</th>
                      <th>Buy $</th>
                      <th>Available</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierPhones.map((phone) => (
                      <>
                        <tr key={phone.id}>
                          <td>
                            <img src={phone.imagePath} alt={phone.model} className="admin-table-img" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/images/fallback.svg' }} />
                          </td>
                          <td>
                            <strong>{phone.brand}</strong><br />
                            <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{phone.model}</span>
                          </td>
                          <td>{phone.ram}</td>
                          <td>{phone.storage}</td>
                          <td>{phone.condition}</td>
                          <td>${phone.perDayPrice.toFixed(2)}</td>
                          <td>${phone.buyPrice.toFixed(0)}</td>
                          <td>
                            <span className={`badge ${phone.available ? 'badge-available' : 'badge-unavailable'}`}>
                              {phone.available ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-outline btn-sm" onClick={() => { setEditing({ ...phone }); setIsAdding(false) }}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(phone.id)}>Del</button>
                            </div>
                          </td>
                        </tr>
                        {editing && editing.id === phone.id && (
                          <tr key={`edit-${phone.id}`}>
                            <td colSpan={9} style={{ padding: '1rem', background: 'var(--blue-50)' }}>
                              <PhoneForm
                                values={editing}
                                onChange={(v) => setEditing({ ...v, id: editing.id })}
                                onSave={handleSaveEdit}
                                onCancel={() => setEditing(null)}
                                saveLabel="Save Changes"
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
