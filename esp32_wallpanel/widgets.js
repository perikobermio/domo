class Widget {
    
    maxValue    = 100
    minValue    = 0
    type        = "º"
    
    constructor(v, title) {
        this.value  = v
        this.title  = title
    }
    
    createFilledRange() {
        let size = {w: 0.15, h: 0.2}
        
        let main = app.CreateLayout("linear", "Vertical")
        let back = app.CreateLayout("linear", "Horizontal")
        let fill = app.CreateLayout("linear", "Horizontal")
        
        let title   = app.CreateText(this.title, 0.4, 0.05, "Center,FontAwesome")
        title.SetTextSize(18)
        let level   = app.CreateText(this.value + this.type, 0.15, 0.05, "Center")
        level.SetTextSize(20)
        
        const _percentToFloat = (p) => {
            return (this.maxValue-p)*size.h/this.maxValue
        }
        const _changeHeight = (nh) => {
            this.value = nh
            level.SetText(this.value + this.type)
            fill.SetSize(size.w, _percentToFloat(nh))
        }
    
        back.SetSize(size.w, size.h)
        back.SetBackColor("#FFA500")
        
        fill.SetSize(size.w, _percentToFloat(this.value))
        fill.SetBackColor("#CCA500")
        
        back.AddChild(fill)
        
        back.SetOnTouchUp((c) => {
            let nh = Math.round((1-c.y[0])*this.value)
            this.value = nh
            level.SetText(this.value + this.type)
            fill.SetSize(size.w, _percentToFloat(nh))
        })
        
        fill.SetOnTouchUp((c) => {
            _changeHeight(this.maxValue - (Math.round(c.y[0] * (this.maxValue - this.value))))
        })
        
        main.AddChild(title)
        main.AddChild(back)
        main.AddChild(level)
        
        return main
    }
}
