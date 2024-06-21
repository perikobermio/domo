var components      = {status: false}
var isProcessing    = false 
var instructions    = []
var bt_name         = "HELLboard"
var pass            = "d41d8cd98f00b204e9800998ecf8427e"
var update_interval = 10000

var water_min_value = 0
var water_max_value = 4095

function OnStart() {
    //Create a layout with objects vertically centered.
    lay = app.CreateLayout("linear", "VCenter")

    //Create Bluetooth serial object.
    connect(bt_name)

    header = app.CreateText("[fa-truck] Iratxo autoka", 1, 0.1, "FontAwesome,Center");
    header.SetPadding(0, 0.01, 0, 0);
    header.SetTextSize(32);
    header.SetBackColor("#332e21");
    header.SetMargins(0.01, 0.01, 0.01, 0.05)
    lay.AddChild(header)
}

function connect() {
    bt = app.CreateBluetoothSerial()
    bt.SetOnConnect(bt_OnConnect)
    bt.SetOnReceive(bt_OnReceive)
    bt.SetSplitMode("End", "\n")
    bt.Connect(bt_name)
}

function bt_OnConnect(ok) {
    if(ok) {
        app.ShowPopup(bt_name+"-ra konektatuta.")

        addInstruction(pass)
        addInstruction("readInputs")
        
        setInterval(function() {
            addInstruction("readInputs")
        }, update_interval);
    } else {
        app.ShowPopup("Connection Failed");
        console.log("Connection Failed");
    }
}

function addInstruction(command) {
    instructions.push(command)
    if(!isProcessing) execNextInstruction()
}

function execNextInstruction() {
    if(instructions.length > 0) {
        if(bt.IsConnected()) {
            var command = instructions.shift()

            isProcessing = true
            bt.Write(command)
        } else {
            connect()
        }
    } else {
        isProcessing = false
    }
}

function bt_OnReceive(inputs) {
    var data = JSON.parse(inputs)

    switch(data.command) {
        case "readInputs": readInputs(data); break;
    }

    execNextInstruction()
}

function readInputs(data) {
    if(components.status) { //onUpdate
        components.water.level.SetTextColor(getLevelColor(getWaterLevel(data.water)))
        components.water.level.SetText("%"+getWaterLevel(data.water))
    } else {
        createComponents(data)
        app.AddLayout(lay)
        components.status = true
    }
}

//Called when user touches the button.
function outLight_OnTouch(state) {
    try {
        if (state)  addInstruction("outLightON")
        else        addInstruction("outLightOFF")
    } catch (e) {
        app.ShowPopup("Connection Failed: " + e.message);
        console.log("Connection Failed: " + e.stack);
    }
}

function createComponents(data) {

    components.outLight = app.CreateToggle("Kanpoko argia", 0.5, 0.1, "FontAwesome")
    components.outLight.SetOnTouch(outLight_OnTouch)
    lay.AddChild(components.outLight)

    var outLightState   = (parseInt(data.outLight) == 1)? true : false
    components.outLight.SetChecked(outLightState)

    ////////////////////

    var row = app.CreateLayout("linear", "Horizontal");
    row.SetSize(0.9, 0.2)
    row.SetMargins(0, 0.02, 0, 0)

    components.cabin_battery        = createRange("[fa-battery-three-quarters] Kabinako bateria", data.cabin_battery)
    row.AddChild(components.cabin_battery)

    components.cabin_battery_volt   = createRange("[fa-bolt] Voltagea", data.cabin_battery_volt+"V", true)
    row.AddChild(components.cabin_battery_volt)

    lay.AddChild(row)

    ////////////////////

    row = app.CreateLayout("linear", "Horizontal");
    row.SetSize(0.9, 0.2)
    row.SetMargins(0, 0.02, 0, 0)

    components.van_battery          = createRange("[fa-battery-three-quarters] Barruko bateria", data.van_battery)
    row.AddChild(components.van_battery)

    components.van_battery_volt     = createRange("[fa-bolt] Voltagea", data.van_battery_volt+"V", true)
    row.AddChild(components.van_battery_volt)

    lay.AddChild(row)

    ////////////////////

    row = app.CreateLayout("linear", "Horizontal");
    row.SetSize(0.9, 0.2)
    row.SetMargins(0, 0.02, 0, 0)

    components.water            = createRange("[fa-tint] Ur garbia", getWaterLevel(data.water) )
    row.AddChild(components.water)

    components.grey_water       = createRange("[fa-tint] Ur grisak", data.grey_water)
    row.AddChild(components.grey_water)

    lay.AddChild(row)
}

function createRange(title, v, literal) {
    // Create a layout for the battery card.
    var card = app.CreateLayout("linear", "Vertical");
    card.SetPadding(0.02, 0.02, 0.02, 0.01);
    card.SetBackColor("#333333"); // Dark grey background
    card.SetSize(0.45, 0.18); // 45% width and 25% height of the screen
    card.SetMargins(0.01, 0.02, 0.01, 0); // Margins for spacing

    // Create a Text element to display the battery title.
    var title = app.CreateText(title, 0.8, 0.07, "FontAwesome,Center")
    title.SetTextSize(16)
    title.SetTextColor("#FFFFFF")
    card.AddChild(title)
    card.title = title

    // Create a Text element to display the battery percentage.
    value       = (literal)? v : "%"+v
    var color   = (literal)? "#ffffff" : getLevelColor(v)
    var level   = app.CreateText(value, 0.8, 0.1, "Center")
    level.SetTextSize(20)
    level.SetTextColor(color)
    card.AddChild(level)
    card.level = level

    return card;
}

function getLevelColor(v) {
    var c = "#0066ff"
    if(v<90) c = "#00fbff"
    if(v<80) c = "#00ff7b"
    if(v<70) c = "#37ff00"
    if(v<60) c = "#99ff00"
    if(v<50) c = "#b0d604"
    if(v<40) c = "#ff9100"
    if(v<30) c = "#ff5e00"
    if(v<20) c = "#ff3700"
    if(v<10) c = "#ff0800"

    return c
}

function getWaterLevel(v) {
    return Math.round(v * 100 / water_max_value)
}