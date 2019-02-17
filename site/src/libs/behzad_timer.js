export default class BehzadTimer
{
    constructor(name, log = true)
    {
        this.name = name;
        this.log = log;
        this.lastTick = -1;
        this.tick = this.tick.bind(this);

    }
    tick(msg='')
    {
        if (!this.log)
            return;
        if(this.lastTick == -1)
        {
            this.lastTick = Date.now();
            console.log(this.name+'=>'+msg+'=> Started @ '+Date.now());
        }
        else
        {
            var diff = Date.now()-this.lastTick;
            this.lastTick = Date.now();
            console.log(this.name+'=>'+msg+'=> After '+diff+' ms');
            
        }
    }
}