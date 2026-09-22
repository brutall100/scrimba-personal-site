// Scrimba challenge, upgraded:
// the original version hard-coded favouriteMovieGenre("..."), favouriteFruit("..."),
// favouriteMode("...") and favouriteEdgeStyle("...").
// Now visitors pick the values themselves and the page restyles itself
// through CSS custom properties.

const OPTIONS = {
    genre: {
        default: "industrial",
        items: {
            industrial: { label: "Industrial", font: "'Barlow Condensed', 'Arial Narrow', sans-serif" },
            space: { label: "Space", font: "'Orbitron', 'Barlow Condensed', sans-serif", google: "Orbitron:wght@700" },
            superhero: { label: "Superhero", font: "'Bangers', 'Barlow Condensed', sans-serif", google: "Bangers" },
            military: { label: "Military", font: "'Black Ops One', 'Barlow Condensed', sans-serif", google: "Black+Ops+One" },
            cowboy: { label: "Cowboy", font: "'Rye', 'Barlow Condensed', sans-serif", google: "Rye" },
            fantasy: { label: "Fantasy", font: "'MedievalSharp', 'Barlow Condensed', sans-serif", google: "MedievalSharp" },
            scary: { label: "Scary", font: "'Creepster', 'Barlow Condensed', sans-serif", google: "Creepster" },
        },
    },
    fruit: {
        default: "none",
        items: {
            none: { label: "Classic yellow", color: "#f2b705" },
            watermelon: { label: "Watermelon", color: "#ef5b6b" },
            orange: { label: "Orange", color: "#f7931e" },
            banana: { label: "Banana", color: "#f5d547" },
            avocado: { label: "Avocado", color: "#86b049" },
            blueberry: { label: "Blueberry", color: "#5b8cff" },
        },
    },
    mode: {
        default: "auto",
        items: {
            auto: { label: "Auto" },
            light: { label: "Light" },
            dark: { label: "Dark" },
        },
    },
    edge: {
        default: "soft",
        items: {
            sharp: { label: "Sharp", radius: "0px" },
            soft: { label: "Soft", radius: "10px" },
            round: { label: "Round", radius: "28px" },
        },
    },
}

const STORAGE_KEY = "personal-site-style"
const root = document.documentElement

function setProp(prop, value) {
    root.style.setProperty(prop, value)
}

function loadGoogleFont(family) {
    const id = "font-" + family
    if (document.getElementById(id)) return
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/css2?family=" + family + "&display=swap"
    document.head.appendChild(link)
}

function favouriteMovieGenre(genre) {
    const item = OPTIONS.genre.items[genre]
    if (item.google) loadGoogleFont(item.google)
    setProp("--font-heading", item.font)
}

function favouriteFruit(fruit) {
    setProp("--accent", OPTIONS.fruit.items[fruit].color)
}

function favouriteMode(mode) {
    if (mode === "auto") {
        root.removeAttribute("data-mode")
    } else {
        root.setAttribute("data-mode", mode)
    }
}

function favouriteEdgeStyle(edge) {
    setProp("--radius", OPTIONS.edge.items[edge].radius)
}

const APPLY = {
    genre: favouriteMovieGenre,
    fruit: favouriteFruit,
    mode: favouriteMode,
    edge: favouriteEdgeStyle,
}

const CALL_NAMES = {
    genre: "favouriteMovieGenre",
    fruit: "favouriteFruit",
    mode: "favouriteMode",
    edge: "favouriteEdgeStyle",
}

function defaults() {
    const state = {}
    for (const group in OPTIONS) state[group] = OPTIONS[group].default
    return state
}

function readSaved() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
        const state = defaults()
        for (const group in OPTIONS) {
            if (saved[group] in OPTIONS[group].items) state[group] = saved[group]
        }
        return state
    } catch {
        return defaults()
    }
}

function save(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // storage blocked (private mode etc.) - the page still works
    }
}

function applyAll(state) {
    for (const group in APPLY) APPLY[group](state[group])
    showCode(state)
}

function showCode(state) {
    const code = document.getElementById("tweak-code")
    if (!code) return
    code.textContent = Object.keys(CALL_NAMES)
        .map((group) => CALL_NAMES[group] + '("' + state[group] + '")')
        .join("  ")
}

function buildChips(state) {
    document.querySelectorAll(".chips[data-group]").forEach((container) => {
        const group = container.dataset.group
        for (const [value, item] of Object.entries(OPTIONS[group].items)) {
            const label = document.createElement("label")
            label.className = "chip"

            const input = document.createElement("input")
            input.type = "radio"
            input.name = group
            input.value = value
            input.id = group + "-" + value
            input.checked = state[group] === value

            const text = document.createElement("span")
            if (item.color) {
                const swatch = document.createElement("i")
                swatch.className = "swatch"
                swatch.style.background = item.color
                text.appendChild(swatch)
            }
            text.append(item.label)

            label.append(input, text)
            container.appendChild(label)
        }
    })
}

// Apply saved choices right away (script is deferred, so the DOM is ready)
let state = readSaved()
applyAll(state)
buildChips(state)

const form = document.getElementById("tweak-form")

form.addEventListener("change", (event) => {
    const { name, value } = event.target
    if (!(name in OPTIONS)) return
    state[name] = value
    APPLY[name](value)
    showCode(state)
    save(state)
})

form.addEventListener("reset", (event) => {
    event.preventDefault()
    state = defaults()
    for (const group in state) {
        document.getElementById(group + "-" + state[group]).checked = true
    }
    applyAll(state)
    save(state)
})
