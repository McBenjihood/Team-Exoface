/* =========================================================
   Cloud-Computer - Mockup
   Team Fonte-Tavina / IPT8.1

   Kleine Interaktionen. Es gibt kein Backend - Starten,
   Stoppen und die Konsolenausgabe werden nur nachgespielt.
   ========================================================= */

var LABEL = {
    running: "läuft",
    stopped: "gestoppt",
    starting: "startet …",
    stopping: "stoppt …",
    resetting: "setzt zurück …"
};

/* Was in der Konsole steht, haengt am Zustand der VM. */
var KONSOLE = {
    running: [
        "[  OK  ] Started Network Manager.",
        "[  OK  ] Started OpenSSH server daemon.",
        "[  OK  ] Reached target Multi-User System.",
        "",
        "Ubuntu 24.04.1 LTS   tty1",
        "",
        "muster@m111-d24a-muster:~$ "
    ],
    stopped: [
        "Keine Verbindung.",
        "Die VM ist gestoppt - auf \"Starten\" klicken, um die Konsole zu öffnen."
    ],
    starting: [
        "Verbindung wird aufgebaut …",
        "[  OK  ] Started Network Manager.",
        "[  OK  ] Started OpenSSH server daemon."
    ],
    stopping: [
        "muster@m111-d24a-muster:~$ sudo poweroff",
        "Stopping user session …",
        "Reached target Shutdown."
    ],
    resetting: [
        "VM wird neu aufgesetzt.",
        "Achtung: alle Daten auf der VM gehen dabei verloren.",
        "Image wird geschrieben …"
    ]
};

/* ---------- Hell / Dunkel ---------- */

function toggleTheme() {
    var root = document.documentElement;
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
        localStorage.setItem("cc-theme", next);
    } catch (e) {
        // Auswahl wird dann nur bis zum Neuladen behalten
    }
}

/* ---------- Auf- und Zuklappen ---------- */

function toggleBox(head) {
    head.parentElement.classList.toggle("open");
}

/* ---------- Konto-Menue ---------- */

function toggleAccount(btn) {
    btn.parentElement.classList.toggle("open");
}

/* ---------- Klick in den aufgeklappten Bereich ---------- */

/* Die ganze Flaeche ist der Weg zur Konsole. Klickt jemand auf einen
   Button darin, soll nur der Button reagieren und die Seite bleiben. */

function goto(el, e) {
    if (e.target.closest("button, a, input, select, textarea")) {
        return;
    }
    var ziel = el.getAttribute("data-href");
    if (ziel) {
        location.href = ziel;
    }
}

/* ---------- Zustand einer VM setzen ---------- */

function setState(scope, state) {
    scope.setAttribute("data-state", state);

    var laeuft = state === "running";
    var wechselt = state === "starting" || state === "stopping" || state === "resetting";

    // Statuspunkt und Beschriftung
    scope.querySelectorAll("[data-status]").forEach(function (pill) {
        var klasse = "status";
        if (state === "stopped") {
            klasse += " off";
        } else if (!laeuft) {
            klasse += " wait";
        }
        pill.className = klasse;
        pill.innerHTML = '<span class="dot"></span>' + LABEL[state];
    });

    // Kacheln mit Zahl und Balken
    scope.querySelectorAll("[data-metric]").forEach(function (el) {
        var zahl = el.querySelector(".zahl");
        var fuellung = el.querySelector(".bar span");
        if (zahl) {
            zahl.textContent = laeuft ? el.getAttribute("data-on") : "–";
        }
        if (fuellung) {
            fuellung.style.width = laeuft ? el.getAttribute("data-bar") + "%" : "0%";
        }
    });

    // Konsole
    scope.querySelectorAll("[data-konsole]").forEach(function (el) {
        el.textContent = KONSOLE[state].join("\n");
        el.scrollTop = el.scrollHeight;
    });

    // Ein Button fuer Starten und Stoppen. Die Beschriftung ist die
    // Aktion, nicht der Zustand: laeuft die VM, steht dort "Stoppen".
    scope.querySelectorAll('[data-act="power"]').forEach(function (btn) {
        btn.textContent = (laeuft || state === "stopping") ? "Stoppen" : "Starten";
        btn.disabled = wechselt;
    });

    scope.querySelectorAll('[data-act="reset"]').forEach(function (btn) {
        btn.disabled = wechselt;
    });
}

/* ---------- Klick auf den Umschalter oder Zuruecksetzen ---------- */

function power(btn) {
    var scope = btn.closest("[data-vm]");
    if (!scope) {
        return;
    }

    var act = btn.getAttribute("data-act");
    var state = scope.getAttribute("data-state");

    if (act === "power") {
        if (state === "running") {
            setState(scope, "stopping");
            setTimeout(function () {
                setState(scope, "stopped");
            }, 1400);
        } else if (state === "stopped") {
            setState(scope, "starting");
            setTimeout(function () {
                setState(scope, "running");
            }, 1400);
        }
    }

    if (act === "reset") {
        setState(scope, "resetting");
        setTimeout(function () {
            setState(scope, "running");
        }, 2200);
    }
}

/* ---------- Start ---------- */

document.addEventListener("DOMContentLoaded", function () {
    // Jede VM in den Zustand bringen, der im HTML steht. Dadurch stimmen
    // Anzeige, Konsole und Button-Beschriftung immer ueberein.
    document.querySelectorAll("[data-vm]").forEach(function (scope) {
        setState(scope, scope.getAttribute("data-state") || "running");
    });

    // vm.html wird von beiden Rollen benutzt. Kommt man als Lernende Person,
    // muessen Marke und Umschalter oben auch dorthin zeigen.
    if (document.documentElement.getAttribute("data-rolle") === "schueler") {
        var brand = document.querySelector(".brand");
        if (brand) {
            brand.setAttribute("href", "schueler.html");
        }
        document.querySelectorAll(".switch a").forEach(function (a) {
            a.classList.toggle("on", a.getAttribute("href").indexOf("schueler") === 0);
        });
    }
});

/* Konto-Menue schliessen, wenn daneben oder Escape geklickt wird. */

document.addEventListener("click", function (e) {
    document.querySelectorAll(".account.open").forEach(function (acc) {
        if (!acc.contains(e.target)) {
            acc.classList.remove("open");
        }
    });
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        document.querySelectorAll(".account.open").forEach(function (acc) {
            acc.classList.remove("open");
        });
    }
});
