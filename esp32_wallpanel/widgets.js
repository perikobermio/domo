class Widget {
    
    maxValue   = 100
    minValue   = 0
    type       = "º"
    backColor  = "#FFA500"
    fillColor  = "#CCA500"
    
    constructor(v, title) {
        this.value      = v
        this.title      = title
    }
    
    _percentToFloat(p, min, max, h) {
        return ((p - min) / (max - min)) * h
    }
    
    createFilledRange() {
        let size = {w: 0.15, h: 0.2}
        
        let main = app.CreateLayout("linear", "Vertical")
        
        let back = app.CreateLayout("Frame")
        let fill = app.CreateLayout("Frame")
        this.even = app.CreateLayout("Frame")
        
        let title = app.CreateText(this.title, 0.4, 0.05, "Center,FontAwesome")
            title.SetTextSize(18)
            
        let level_lay = app.CreateLayout("linear", "Horizontal")
        let level = app.CreateText(this.value + this.type, 0.15, 0.05, "Center")
            level.SetTextSize(20)
        let btn_minus = app.CreateButton("+", 0.1, 0.1);
            btn_minus.SetBackColor("#00FFFF")
            btn_minus.SetStyle("#00FFFF", "#00FFFF", 5)
            btn_minus.SetTextSize(24)
            btn_minus.SetTextColor("#000000")
        
        //level_lay.AddChild(btn_minus)
        level_lay.AddChild(level)
        
        this._onChange = (self, position) => {
            const _percentToFloat = (p) => {
                return ((p - self.minValue) / (self.maxValue - self.minValue)) * size.h
            }
            
            if(position > 1) position = 1
            if(position < 0) position = 0
            
            let nh = Math.round( (self.maxValue + (self.minValue - self.maxValue) * position ))
            
            level.SetText(nh + self.type)
            fill.SetSize(size.w, size.h - _percentToFloat(nh, self.maxValue, self.minValue, size.h))
            return nh
        }
    
        this.even.SetSize(size.w, size.h)
        this.even.SetBackColor("#00FFFFFF")
        
        back.SetSize(size.w, size.h)
        back.SetBackColor(this.backColor)
        back.SetPosition( 0,0 )
        
        fill.SetSize(size.w, size.h - this._percentToFloat(this.value, this.minValue, this.maxValue, size.h))
        fill.SetBackColor(this.fillColor)
        fill.SetPosition( 0,0 )
        
        back.AddChild(fill)
        back.AddChild(this.even)
        
        main.AddChild(title)
        main.AddChild(back)
        main.AddChild(level_lay)
        
        return main
    }
}
