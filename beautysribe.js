const HIGHLIGHT_CLASS = "highlighted"

function pipe(...args) {
  const value = args[0]
  const fns = args.slice(1, args.length)

  return fns.reduce((fn, acc) => fn(acc), value)
}

function removeAll(list) {
  Array.from(list).forEach(x => x.remove())
}

function removeClass(list, className) {
  if (!list) return
  if (!className) return

  Array.from(list).forEach(x => x.classList.remove(className))
}

function setupContainer() {
  const className = "beautyscribe"
  const battlescribeContainer = document.querySelector("div.battlescribe")
  const container = createElement("div", null, { className })

  document.body.insertBefore(container, battlescribeContainer)

  return container
}

function getTitle() {
  return document.querySelector(".battlescribe h1").innerText
}

function getConfiguration() {
  const configuration = document
    .querySelector(".force .category:first-child .rootselection p:first-of-type")

  configuration.querySelector("span").remove()

  return configuration.innerText
}


function insertConfiguration(container, config) {
  const h1 = container.querySelector("h1")
  const className = "list-configuration"
  const configuration = createElement("p", config, { className })

  h1.after(configuration)
}

function unitToJSON(unit) {
  const nameAndPoints = unit.querySelector("h4").innerText
  const abilityTable = Array
    .from(unit.querySelectorAll("th"))
    .find(unit => unit.innerText === "Ability")
    .parentNode
    .parentNode



  const name = nameAndPoints.split(/\s\[/)[0]
  const points = parseInt(nameAndPoints.match(/\s\[(\d{1,3})pts\]/)[1], 10)
  const attributesTable = Array
    .from(unit.querySelectorAll("th"))
    .find(unit => unit.innerText === "Model")
    .parentNode
    .parentNode

  const tds = Array.from(attributesTable.querySelectorAll("tr:last-child td"))
  const attrMap = ["M", "WS", "BS", "S", "T", "W", "A", "Ld", "Sv", "Max"]
  const attributes = tds
    .slice(1, tds.length - 2)
    .map(td => td.innerText)
    .reduce((acc, attr, i) => {
      return {
        ...acc,
        [attrMap[i]]: attr
      }
    }, {})


  const trs = abilityTable.querySelectorAll("tr")
  const abilityRows = Array
    .from(trs)
    .slice(1, trs.length)

  const abilities = abilityRows.map(ability => {
    const name = ability.querySelector("td").innerText
    const description = ability.querySelector("td:nth-child(2)").innerText
    return { name, description }
  }, [])

  return { name, points, attributes, abilities }
}

function getUnits() {
  const lis = Array.from(document.querySelectorAll(".force li.category li.rootselection"))
  const units = lis.slice(1, lis.length)

  return units.map(unitToJSON)
}

function createTable({ className, header = true }) {
  const table = createElement("table")
  if (className) table.classList.add(className)
  const thead = header ? table.createTHead() : undefined
  const head = header ? thead.insertRow() : undefined
  const body = table.createTBody()

  if (thead) table.appendChild(thead)
  table.appendChild(body)

  return {
    table,
    head,
    body
  }
}

function createAttributesTable({ name, points, attributes, abilities }) {
  const classes = ["flex-table"]

  const header = createElement(
    "div",
    Object.keys(attributes).map(attr => {
      return createElement("div", attr, { className: "unit-attribute-header" })
    }),
    { classes: classes.concat("unit-attributes-header") }
  )

  const body = createElement(
    "div",
    Object.values(attributes).map(value => {
      return createElement("div", value, { className: "unit-attribute-value" })
    }),
    { classes: classes.concat("unit-attributes-values") }
  )

  const className = "unit-attributes"

  return createElement(
    "div",
    [header, body],
    { className }
  )
}

function textToElement(subject) {
  return typeof subject === "string"
    ? document.createTextNode(subject)
    : subject
}

function times(x, fn) {
  return Array.from(Array(x)).map((x, i) => fn(i + 1))
}

function createElement(tag, contents, opts = {}) {
  const { className, classes } = opts
  const el = document.createElement(tag)
  if (className) el.classList.add(className)
  if (classes) classes.forEach(c => el.classList.add(c))

  let child = contents

  if (Array.isArray(contents)) {
    child = document.createDocumentFragment();
    contents.forEach(item => child.appendChild(textToElement(item)))
  }

  if (typeof contents === "string") child = document.createTextNode(contents)

  if (child) el.appendChild(child)

  return el
}

function createHeader(contents) {
  return createElement("th", contents)
}

function createCell(contents) {
  return createElement("td", contents)
}

function addCell(row, contents) {
  const cell = createCell(contents)
  row.appendChild(cell)
  return cell
}


function createAbilitiesTable({ abilities }) {
  const { table, head, body } = createTable({ className: "abilities", header: false })
  abilities.map(({ name, description }) => {
    const row = body.insertRow()
    const nameCell = addCell(row, name)
    const descriptionCell = addCell(row, description)
  })

  return table
}

function isSpecialExpCheckbox(n) {
  return (n === 3 || n === 7 || n === 12)
}

function createCheckboxSection(count, createCheckbox) {
  const className = "checkboxes"
  const checkboxes = times(count, createCheckbox)
  return createElement("section", checkboxes, { className })
}

function createExperienceCheckbox(n) {
  const defaultClasses = ["checkbox", "unit-exp-checkbox"]

  const classes = isSpecialExpCheckbox(n)
    ? defaultClasses.concat(HIGHLIGHT_CLASS)
    : defaultClasses

  return createElement("div", null, { classes })
}

function createWoundCheckbox(n) {
  const classes = ["unit-wound-checkbox", "checkbox"]
  return createElement("div", null, { classes })
}

function createFleshWoundCheckbox(n) {
  const classes = ["unit-flesh-wound-checkbox", "checkbox", "highlighted"]
  return createElement("div", null, { classes })
}

function createExperienceSection() {
  const className = "unit-experience"

  return createElement(
    "section",
    [
      createElement("h3", "Experience:"),
      createCheckboxSection(12, createExperienceCheckbox),
    ],
    { className }
  )
}

function createWoundSection(wounds) {
  const className = "unit-wounds"

  return createElement(
    "section",
    [
      createElement("h3", "Wounds:"),
      createCheckboxSection(wounds, createWoundCheckbox)
    ],
    { className }
  )
}

function createFleshWoundSection(wounds) {
  const className = "unit-flesh-wounds"

  return createElement(
    "section",
    [
      createElement("h3", "Flesh Wounds:"),
      createCheckboxSection(wounds, createFleshWoundCheckbox)
    ],
    { className }
  )
}

function createDataSection({ attributes: { W: wounds }}) {
  return createElement("section", [
    createExperienceSection(),
    createWoundSection(wounds),
    createFleshWoundSection(wounds)
  ], { className: "unit-data" })
}

function insertUnits(container, units) {
  const unitList = createElement(
    "ul",
    units.map((unit) => {
      return createElement(
        "li", [
          createElement("h2", unit.name),
          createAttributesTable(unit),
          createElement("h3", "Abilities:"),
          createAbilitiesTable(unit),
          createDataSection(unit),
        ],
        { className: "unit" })
    }),
    { className: "units"})


  container.appendChild(unitList)
}

function getAbilities() {
  const lis = Array.from(document.querySelectorAll(".force li.category li.rootselection"))
  const units = lis.slice(1, lis.length)


}

function beautify() {
  const container = setupContainer()
  container.appendChild(createElement("h1", getTitle()))
  insertConfiguration(container, getConfiguration())
  insertUnits(container, getUnits())

  // document.querySelector("div.battlescribe").remove()
  console.log("beautified!")
}

beautify()
