class Widget {
    
    maxValue   = 100
    minValue   = 0
    type       = "º"
    backColor  = "#FFA500"
    fillColor  = "#CCA500"
    steps      = 1
    
    constructor(v, title) {
        this.value      = v
        this.title      = title
        this.size       = {w: 0.15, h: 0.2}
    }
    
    _percentToFloat(p, min, max, h) {
        return ((p - min) / (max - min)) * h
    }
    
    onChange(position, nh) {
        const _percentToFloat = (p) => {
            return ((p - this.minValue) / (this.maxValue - this.minValue)) * this.size.h
        }
        
        if(position) {
            if(position > 1) position = 1
            if(position < 0) position = 0
            
            nh = Math.round( (this.maxValue + (this.minValue - this.maxValue) * position ))
        }
            
        if(nh > this.maxValue) nh = this.maxValue
        if(nh < this.minValue) nh = this.minValue
        
        this.level.SetText(nh + this.type)
        this.fill.SetSize(this.size.w, this.size.h - _percentToFloat(nh, this.maxValue, this.minValue, this.size.h))
        
        this.value = nh
        return nh
    }
    
    onMinus() {
       this.onChange(null, this.value - this.steps)
    }
    
    onPlus() {
       this.onChange(null, this.value + this.steps)
    }
    
    createFilledRange() {
        let main = app.CreateLayout("linear", "Vertical")
        
        let back = app.CreateLayout("Frame")
        this.fill = app.CreateLayout("Frame")
        this.even = app.CreateLayout("Frame")
        
        let title = app.CreateText(this.title, 0.4, 0.05, "Center,FontAwesome")
            title.SetTextSize(18)
            
        let level_lay = app.CreateLayout("linear", "Horizontal")
        
        this.level = app.CreateText(this.value + this.type, 0.15, 0.05, "Center")
        this.level.SetTextSize(20)
            
        this.btn_minus = app.CreateButton("[fa-minus]", 0.1, 0.05, "FontAwesome")
        this.btn_minus.SetTextSize(12)
        this.btn_minus.SetTextColor("#ffffff")
        this.btn_minus.SetBackColor("#00FFFFFF")
        this.btn_minus.SetStyle("#00FFFFFF", "#00FFFFFF", 0, "#00FFFFFF", 0)
            
        this.btn_plus = app.CreateButton("[fa-plus]", 0.1, 0.05, "FontAwesome")
        this.btn_plus.SetTextSize(12)
        this.btn_plus.SetTextColor("#ffffff")
        this.btn_plus.SetBackColor("#00FFFFFF")
        this.btn_plus.SetStyle("#00FFFFFF", "#00FFFFFF", 0, "#00FFFFFF", 0)
        
        level_lay.AddChild(this.btn_minus)
        level_lay.AddChild(this.level)
        level_lay.AddChild(this.btn_plus)
    
        this.even.SetSize(this.size.w, this.size.h)
        this.even.SetBackColor("#00FFFFFF")
        
        back.SetSize(this.size.w, this.size.h)
        back.SetBackColor(this.backColor)
        back.SetPosition( 0,0 )
        
        this.fill.SetSize(this.size.w, this.size.h - this._percentToFloat(this.value, this.minValue, this.maxValue, this.size.h))
        this.fill.SetBackColor(this.fillColor)
        this.fill.SetPosition( 0,0 )
        
        back.AddChild(this.fill)
        back.AddChild(this.even)
        
        main.AddChild(title)
        main.AddChild(back)
        main.AddChild(level_lay)
        
        return main
    }
}
