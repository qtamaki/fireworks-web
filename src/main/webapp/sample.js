(function ()
{
    var R2 = 2 * Math.PI, WIDTH = 1000, HEIGHT = 560, DOT_COUNT = 600, DEC = 0.96, lim = 0.86 * WIDTH, min = 0.125 * WIDTH, circle = 0.5 * WIDTH;

    function C()
    {
        c2d.globalCompositeOperation = "source-over";
        c2d.fillStyle = "rgba(8,8,12,0.65)";
        c2d.fillRect(0, 0, WIDTH, HEIGHT);
        c2d.globalCompositeOperation = "lighter";
        // x,y: 前回のキャプチャからのカーソル移動量
        x = curX - lastX; 
        y = curY - lastY;
        lastX = curX;
        lastY = curY;
        for (var i = DOT_COUNT; i--; )
        {
            // h: dotとカーソルとの距離
            var dot = DotList[i], b = dot.x - curX, a = dot.y - curY, h = Math.sqrt(a * a + b * b) || 0.001
            sin = a / h;
            cos = b / h;
            // ボタン押下時、hが画面幅の半分以下の円内にいるdotを弾き飛ばす
            if (w && h < circle) {
                var s = 14 * (1 - h  / circle);
                dot.a = dot.a + (cos * s + 0.5 - Math.random());
                dot.b = dot.b + (sin * s + 0.5 - Math.random());
            }
            // hが、画面幅の86%以下であった場合dot.{a,b}を減らす(カーソルに向かう勢いを増す)
            h < lim && (s = 0.0014  * (1 - h / lim) * WIDTH, dot.a -= cos * s, dot.b -= sin * s);
            // hが、画面幅の12.5%以下ならば、カーソルの動きに応じてdot.{a,b}をすこし増やす(カーソルに向かう勢いを減じる)
            h < min && (s = 0.00026 * (1 - h / min) * WIDTH, dot.a += x * s, dot.b += y * s);
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
    function OnMouseMove(ev)
    {
        ev = ev ? ev : window.event;
        curX = ev.clientX - outer.offsetLeft - canCon.offsetLeft;
        curY = ev.clientY - outer.offsetTop - canCon.offsetTop
    }
    function F()
    {
        w = !0;
        return!1
    }
    function G()
    {
        return w = !1
    }
    /*
     * 画面上の点を表すクラス
     * a,b: 点のサイズと弾ける勢いを表す(勢い良ければサイズもでかい)
     * x,y: 点の現在地
     */
    function Dot()
    {
        this.color = "rgb(" + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + ")";
        this.b = this.a = this.x = this.y = 0;
    }

    var DotList = [], mainCan, c2d, canCon, outer, curX, curY, x, y, lastX, lastY, w;
    window.onload = function ()
    {
        manCan = document.getElementById("mainCanvas");
        if (manCan.getContext)
        {
            outer = document.getElementById("outer");
            canCon = document.getElementById("canvasContainer");
            c2d = manCan.getContext("2d");
            for (var i = DOT_COUNT; i--; )
            {
                var l = new Dot;
                l.x = 0.5 * WIDTH;
                l.y = 0.5 * HEIGHT;
                l.a = 34 * Math.cos(i) * Math.random();
                l.b = 34 * Math.sin(i) * Math.random();
                DotList[i] = l
            }
            curX = lastX = 0.5 * WIDTH;
            curY = lastY = 0.5 * HEIGHT;
            document.onmousedown = F;
            document.onmouseup = G;
            document.onmousemove = OnMouseMove;
            setInterval(C, 100);
            document.getElementById("output").innerHTML = 'interact with the mouse'
        }
        else
        {
            document.getElementById("output").innerHTML = "Sorry, needs a recent version of Chrome, Firefox, Opera, Safari, or Internet Explorer 9.";
        }
    }
})();
