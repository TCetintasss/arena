import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const HERO_CLASSES = [
  { id: 'warrior', name: 'Warrior', role: 'Tank', hp: 130, atk: 18, def: 14, spd: 7, crit: 5 },
  { id: 'assassin', name: 'Assassin', role: 'Crit / Speed', hp: 90, atk: 24, def: 7, spd: 15, crit: 18 },
  { id: 'mage', name: 'Mage', role: 'Magic Damage', hp: 95, atk: 27, def: 6, spd: 9, crit: 10 },
  { id: 'ranger', name: 'Ranger', role: 'Dodge / Range', hp: 105, atk: 21, def: 9, spd: 13, crit: 12 },
  { id: 'paladin', name: 'Paladin', role: 'Shield / Sustain', hp: 120, atk: 16, def: 17, spd: 6, crit: 4 },
]

function getPower(char) {
  return char.hp + char.atk * 8 + char.def * 7 + char.spd * 5 + char.crit * 6
}

function App() {
  const [screen, setScreen] = useState('auth')
  const [mode, setMode] = useState('login')
  const [users, setUsers] = useState([{ id: 'demo', username: 'taha', pin: '123456', characters: [] }])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('warrior')
  const [characterName, setCharacterName] = useState('')
  const [activeCharacterId, setActiveCharacterId] = useState(null)

  const currentUser = users.find((u) => u.id === currentUserId)
  const activeCharacter = currentUser?.characters.find((c) => c.id === activeCharacterId)

  function handleAuth() {
    const cleanUser = username.trim().toLowerCase()
    const cleanPin = pin.trim()
    setError('')

    if (!cleanUser || !cleanPin) {
      setError('Kullanıcı adı ve PIN zorunlu.')
      return
    }

    if (mode === 'login') {
      const found = users.find((u) => u.username === cleanUser && u.pin === cleanPin)
      if (!found) {
        setError('Kullanıcı adı veya PIN hatalı.')
        return
      }
      setCurrentUserId(found.id)
      setUsername('')
      setPin('')
      setScreen('characters')
      return
    }

    if (users.some((u) => u.username === cleanUser)) {
      setError('Bu kullanıcı adı zaten alınmış.')
      return
    }

    const newUser = { id: crypto.randomUUID(), username: cleanUser, pin: cleanPin, characters: [] }
    setUsers((prev) => [...prev, newUser])
    setCurrentUserId(newUser.id)
    setUsername('')
    setPin('')
    setScreen('characters')
  }

  function createCharacter() {
    if (!currentUser) return
    if (!characterName.trim()) return
    if (currentUser.characters.length >= 4) return

    const cls = HERO_CLASSES.find((c) => c.id === selectedClassId)
    const newCharacter = {
      id: crypto.randomUUID(),
      name: characterName.trim(),
      classId: cls.id,
      className: cls.name,
      level: 1,
      xp: 0,
      gold: 100,
      arenaElo: 1000,
      hp: cls.hp,
      atk: cls.atk,
      def: cls.def,
      spd: cls.spd,
      crit: cls.crit,
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, characters: [...u.characters, newCharacter] } : u
      )
    )

    setActiveCharacterId(newCharacter.id)
    setCharacterName('')
    setScreen('characters')
  }

  function logout() {
    setCurrentUserId(null)
    setActiveCharacterId(null)
    setScreen('auth')
  }

  return (
    <main className="app">
      <section className="phone">
        <header className="header">
          <div>
            <p className="eyebrow">Holiday Arena</p>
            <h1>Mobil RPG Arena</h1>
          </div>
          {currentUser && <button className="small-btn" onClick={logout}>Çıkış</button>}
        </header>

        {screen === 'auth' && (
          <div className="card stack">
            <div className="tabs">
              <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => { setMode('login'); setError('') }}>Giriş Yap</button>
              <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => { setMode('register'); setError('') }}>Kayıt Ol</button>
            </div>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kullanıcı adı" />
            <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" type="password" />
            {error && <div className="error">{error}</div>}
            <button className="primary" onClick={handleAuth}>{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</button>
            <p className="hint">Demo giriş: taha / 123456</p>
          </div>
        )}

        {screen === 'characters' && currentUser && (
          <div className="card stack">
            <div className="row">
              <div>
                <p className="muted">Hoş geldin</p>
                <h2>{currentUser.username}</h2>
              </div>
              <strong className="pill">{currentUser.characters.length}/4</strong>
            </div>

            {currentUser.characters.length === 0 && <div className="empty">Henüz karakterin yok. İlk karakterini oluştur.</div>}

            <div className="char-list">
              {currentUser.characters.map((char) => (
                <button
                  key={char.id}
                  className={activeCharacterId === char.id ? 'char-card selected' : 'char-card'}
                  onClick={() => setActiveCharacterId(char.id)}
                >
                  <span>
                    <b>{char.name}</b>
                    <small>Lv.{char.level} {char.className}</small>
                  </span>
                  <strong>PWR {getPower(char)}</strong>
                </button>
              ))}
            </div>

            <button className="primary" disabled={currentUser.characters.length >= 4} onClick={() => setScreen('create')}>Karakter Oluştur</button>
            <button className="secondary" disabled={!activeCharacter} onClick={() => setScreen('home')}>Seçili Karakterle Giriş Yap</button>
            {currentUser.characters.length >= 4 && <p className="warning">Maksimum 4 karakter oluşturabilirsin.</p>}
          </div>
        )}

        {screen === 'create' && currentUser && (
          <div className="card stack">
            <h2>Karakter Oluştur</h2>
            <input value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Karakter adı" maxLength={16} />

            <div className="class-list">
              {HERO_CLASSES.map((cls) => (
                <button key={cls.id} className={selectedClassId === cls.id ? 'class-card selected' : 'class-card'} onClick={() => setSelectedClassId(cls.id)}>
                  <b>{cls.name}</b>
                  <span>{cls.role}</span>
                  <small>HP {cls.hp} | ATK {cls.atk} | DEF {cls.def} | SPD {cls.spd} | CRIT {cls.crit}%</small>
                </button>
              ))}
            </div>

            <button className="primary" onClick={createCharacter}>Oluştur</button>
            <button className="secondary" onClick={() => setScreen('characters')}>Geri</button>
          </div>
        )}

        {screen === 'home' && activeCharacter && (
          <div className="card stack">
            <div className="hero-panel">
              <p>Aktif Karakter</p>
              <h2>{activeCharacter.name}</h2>
              <span>Lv.{activeCharacter.level} {activeCharacter.className}</span>
              <strong>POWER {getPower(activeCharacter)}</strong>
            </div>
            <div className="stats-grid">
              <div>Gold<br /><b>{activeCharacter.gold}</b></div>
              <div>Arena Elo<br /><b>{activeCharacter.arenaElo}</b></div>
            </div>
            <button className="secondary" onClick={() => setScreen('characters')}>Karakter Seçimine Dön</button>
          </div>
        )}
      </section>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
