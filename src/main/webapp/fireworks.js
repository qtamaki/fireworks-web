(function () {

    var R2 = 2 * Math.PI, WIDTH = 1000, HEIGHT = 560, DOT_COUNT = 600, DEC = 0.96, lim = 0.86 * WIDTH, min = 0.125 * WIDTH, circle = 0.5 * WIDTH;

    function Dot() {
        this.color = "rgb(" + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + ")";
        this.b = this.a = this.x = this.y = 0;
        this.burnup = !1;
        this.lastH = 0;
    }

    function Firework(dotCount, x, y) {
        var initPow = 34;
        this.dotCount = dotCount;
        this.burnups = 0;
        this.list = [];
        this.baseX = x;
        this.baseY = y;
        for(var i = dotCount; i--; ) {
            var d = new Dot;
            d.a = (i % 60 + i / 60) * Math.cos((i % 60) / 60 * R2);// * Math.random();
            d.b = (i % 60 + i / 60) * Math.sin((i % 60) / 60 * R2);// * Math.random();
            //d.a = initPow * Math.cos(i) * Math.random();
            //d.b = initPow * Math.sin(i) * Math.random();
            d.x = x + d.a;
            d.y = y + d.b;
            this.list[i] = d;
        }
        this.draw = function(c2d) {
            for (var i = this.dotCount; this.dotCount > this.burnups && i--; )
            {
                // h: dotとカーソルとの距離
                var dot = this.list[i], b = dot.x - this.baseX, a = dot.y - this.baseY, h = Math.sqrt(a * a + b * b) || 0.001;
                var sin = a / h;
                var cos = b / h;
                if(h + 3 < dot.lastH) {
                    this.burnups += 1;
                    dot.burnup = !0;
                    continue;
                }
                dot.lastH = h;
                // hが、画面幅の86%以下であった場合dot.{a,b}を減らす(カーソルに向かう勢いを増す)
                h < lim && (s = 0.0014  * (1 - h / lim) * WIDTH, dot.a -= cos * s, dot.b -= sin * s);
                // hが、画面幅の12.5%以下ならば、カーソルの動きに応じてdot.{a,b}をすこし増やす(カーソルに向かう勢いを減じる)
                //h < min && (s = 0.00026 * (1 - h / min) * WIDTH, dot.a += x * s, dot.b += y * s);
                // dot.{a,b}の自然減
                dot.a *= DEC;
                dot.b *= DEC;
                // dot.{a,b}の絶対値を取って0.1以下であったら～3倍する
                var absa = Math.abs(dot.a);
                var absb = Math.abs(dot.b);
                0.1 > absa && (dot.a *= 3 * Math.random());
                0.1 > absb && (dot.b *= 3 * Math.random());
                // dot.{a,b}(勢い)分、x,yを増減させる(カーソルから離れる or 近づく)
                dot.x += dot.a;
                dot.y += dot.b;
                dot.x > WIDTH ? (dot.x = WIDTH, dot.a *=- 1) : 0 > dot.x && (dot.x = 0, dot.a *=- 1);
                dot.y > HEIGHT ? (dot.y = HEIGHT, dot.b *=- 1) : 0 > dot.y && (dot.y = 0, dot.b *=- 1);
                c2d.fillStyle = dot.color;
                c2d.beginPath();
                var size = Math.max(Math.min((0.45 * 0.5 * (absa + absb)), 3.5), 0.4);
                c2d.arc(dot.x, dot.y, size, 0, R2, !0);
                c2d.closePath();
                c2d.fill()
            }
        }
    }

    function DrawUtil() {
        this.mainCanvas = document.getElementById("mainCanvas");
        this.isActive = function () { return mainCanvas.getContext; }
        if (this.isActive()) {
            this.canvasContainer = document.getElementById("canvasContainer");
            this.outer = document.getElementById("outer");
            this.context2d = mainCanvas.getContext("2d");
        }
    }

    function run () {
        c2d = dutil.context2d;
        c2d.globalCompositeOperation = "source-over";
        c2d.fillStyle = "rgb(8,8,12)";
        c2d.fillRect(0, 0, WIDTH, HEIGHT);
        c2d.globalCompositeOperation = "lighter";
        for(var i = Fireworks.length; i--;){
            var fw = Fireworks[i];
            fw.draw(c2d);
        }
    }
    function OnMouseDown(ev)
    {
        ev = ev ? ev : window.event;
        var curX = ev.clientX - dutil.outer.offsetLeft - dutil.canvasContainer.offsetLeft;
        var curY = ev.clientY - dutil.outer.offsetTop - dutil.canvasContainer.offsetTop
        var fw = new Firework(600, curX, curY);
        Fireworks.push(fw);
        return !1
    }
    var Fireworks = [], dutil;
    window.onload = function () {
        dutil = new DrawUtil;
        if (dutil.isActive())
        {
            document.onmousedown = OnMouseDown;
            setInterval(run, 66);
            document.getElementById("output").innerHTML = 'OK.';
        }
        else
        {
            document.getElementById("output").innerHTML = "Sorry, unsupported version.";
        }
    }
})();
