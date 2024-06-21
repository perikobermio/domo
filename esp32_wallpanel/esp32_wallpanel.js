class Panel {

    bt              = null
    bt_name         = "IratxoVan"
    pass            = "d41d8cd98f00b204e9800998ecf8427e"

    components      = {status: false}
    isProcessing    = false 
    instructions    = []
    
    update_interval = 10000

    water_min_value = 0
    water_max_value = 4095

    constructor(params) {
        this.init()
    }

    init() {
        app.PreventScreenLock(false)
        this._connect(this)

        this.components.lay = app.CreateLayout("linear", "VCenter")

        let header = app.CreateText("[fa-truck] Iratxo autoka", 1, 0.1, "FontAwesome,Center");
        header.SetPadding(0, 0.01, 0, 0);
        header.SetTextSize(32);
        header.SetBackColor("#332e21");
        header.SetMargins(0.01, 0.01, 0.01, 0.05)
        this.components.lay.AddChild(header)
    }

    _connect(self) {

        self.bt = app.CreateBluetoothSerial()
        self.bt.SetOnConnect(socket => self._onBtConnect(self, socket))
        self.bt.SetOnReceive(inputs => self._onBtReceive(self, inputs))
        self.bt.SetSplitMode("End", "\n")
        self.bt.Connect(self.bt_name)
    }

    _onBtConnect(self, socket) {

        if(!socket) {
            app.ShowPopup("Arazoak BT konexioan")
            return false
        }

        app.ShowPopup(self.bt_name+"-ra konektatuta.")

        self._addInstruction(self, self.pass)
        self._addInstruction(self, "readInputs")

        setInterval(function() {
            self._addInstruction(self, "readInputs")
        }, self.update_interval)
            
    }

    _onBtReceive(self, inputs) {
        const data = JSON.parse(inputs)
    
        switch(data.command) {
            case "readInputs": self._readInputs(self, data); break;
        }
    
        self._execNextInstruction(self)
    }

    _readInputs(self, data) {
        if(self.components.status) { //onUpdate
            //self.components.water.level.SetTextColor(self._getLevelColor(self._getWaterLevel(data.water)))
            //self.components.water.level.SetText("%"+self._getWaterLevel(data.water))
        } else {
            self._createComponents(self, data)
            app.AddLayout(self.components.lay)
            self.components.status = true
        }
    }

    _createComponents(self, data) {

        self.components.outLight = app.CreateToggle("Kanpoko argia", 0.5, 0.1, "FontAwesome")
        self.components.outLight.SetOnTouch(state => self._outLight_OnTouch(self, state))
        self.components.lay.AddChild(self.components.outLight)
    
        const outLightState   = (parseInt(data.outLight) == 1)? true : false
        self.components.outLight.SetChecked(outLightState)
    
        ////////////////////
    
        let row = app.CreateLayout("linear", "Horizontal");
        row.SetSize(0.9, 0.2)
        row.SetMargins(0, 0.02, 0, 0)
    
        self.components.cabin_battery        = self._createRange(self, "[fa-battery-three-quarters] Kabinako bateria", data.cabin_battery)
        row.AddChild(self.components.cabin_battery)
    
        self.components.cabin_battery_volt   = self._createRange(self, "[fa-bolt] Voltagea", data.cabin_battery_volt+"V", true)
        row.AddChild(self.components.cabin_battery_volt)
    
        self.components.lay.AddChild(row)
    
        ////////////////////
    
        row = app.CreateLayout("linear", "Horizontal");
        row.SetSize(0.9, 0.2)
        row.SetMargins(0, 0.02, 0, 0)
    
        self.components.van_battery          = self._createRange(self, "[fa-battery-three-quarters] Barruko bateria", data.van_battery)
        row.AddChild(self.components.van_battery)
    
        self.components.van_battery_volt     = self._createRange(self, "[fa-bolt] Voltagea", data.van_battery_volt+"V", true)
        row.AddChild(self.components.van_battery_volt)
    
        self.components.lay.AddChild(row)
    
        ////////////////////
    
        row = app.CreateLayout("linear", "Horizontal");
        row.SetSize(0.9, 0.2)
        row.SetMargins(0, 0.02, 0, 0)
    
        self.components.water            = self._createRange(self, "[fa-tint] Ur garbia", self._getWaterLevel(self, data.water) )
        row.AddChild(self.components.water)
    
        self.components.grey_water       = self._createRange(self, "[fa-tint] Ur grisak", data.grey_water)
        row.AddChild(self.components.grey_water)
    
        self.components.lay.AddChild(row)
    }

    _createRange(self, caption, v, literal) {
        // Create a layout for the battery card.
        let card = app.CreateLayout("linear", "Vertical");
        card.SetPadding(0.02, 0.02, 0.02, 0.01);
        card.SetBackColor("#333333"); // Dark grey background
        card.SetSize(0.45, 0.18); // 45% width and 25% height of the screen
        card.SetMargins(0.01, 0.02, 0.01, 0); // Margins for spacing
    
        // Create a Text element to display the battery title.
        let title = app.CreateText(caption, 0.8, 0.07, "FontAwesome,Center")
        title.SetTextSize(16)
        title.SetTextColor("#FFFFFF")
        card.AddChild(title)
        card.title = title
    
        // Create a Text element to display the battery percentage.
        const value       = (literal)? v : "%"+v
        const color = (literal)? "#ffffff" : self._getLevelColor(v)
        let level   = app.CreateText(value, 0.8, 0.1, "Center")
        level.SetTextSize(20)
        level.SetTextColor(color)
        card.AddChild(level)
        card.level = level
    
        return card;
    }



    _outLight_OnTouch(self, state) {
        try {
            if (state)  self._addInstruction(self, "outLightON")
            else        self._addInstruction(self, "outLightOFF")
        } catch (e) {
            app.ShowPopup("Connection Failed: " + e.message)
        }
    }




    _addInstruction(self, command) {
        self.instructions.push(command)
        if(!self.isProcessing) self._execNextInstruction(self)
    }

    _execNextInstruction(self) {
        if(self.instructions.length > 0) {
            if(self.bt.IsConnected()) {
                let command = self.instructions.shift()
    
                self.isProcessing = true
                self.bt.Write(command)
            } else  self._connect(self)
            
        } else      self.isProcessing = false
    }

    _getLevelColor(v) {
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

    _getWaterLevel(self, v) {
        return Math.round(v * 100 / self.water_max_value)
    }

}

function OnStart() {
    new Panel()
}
