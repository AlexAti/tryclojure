var currentPage = -1;
var pageNames = [
			"page1",
			"page2",
			"page3",
			"page4",
			"page5",
			"page6",
			"page7",
			"page8",
			"page9",
			"page10",
			"page11"
		];
var pages = [
    {
        verify: function(data) { return false; }
    },
    {
        verify: function(data) { return data.expr == "(+ 3 3)"; }
    },
    {
        verify: function(data) { return data.expr == "(/ 10 3)"; }
    },
    {
        verify: function(data) { return data.expr == "(/ 10 3.0)"; }
    },
    {
        verify: function(data) { return data.expr == "(+ 1 2 3 4 5 6)"; }
    },
    {
        verify: function (data) { return data.expr == "(defn square [x] (* x x))"; }
    },
    {
        verify: function (data) { return data.expr == "(square 10)"; }
    },
    {
        verify: function (data) { return data.expr == "((fn [x] (* x x)) 10)"; }
    },
    {
        verify: function (data) { return data.expr == "(def square (fn [x] (* x x)))"; }
    },
    {
        verify: function (data) { return data.expr == "(map inc [1 2 3 4])"; }
    },
    {
        verify: function (data) { return false; }
    }
];

function showPage(n) {
    if (pages[n]) {
        currentPage = n;

        var block = $("#changer");
        block.fadeOut(function(e) {
            block.load("/tutorial", { 'page' : pageNames[n+1] }, function() {
                block.fadeIn();
                changerUpdated();
            });
        });
    }
}

function setupLink(url) {
    return function(e) { $("#changer").load(url, function(data) { $("#changer").html(data); }); }
}

function setupExamples(controller) {
    $(".code").click(function(e) {
        controller.promptText($(this).text());
    });
}

function getStep(n, controller) {
    $("#tuttext").load("tutorial", { step: n }, function() { setupExamples(controller); });
}

function eval_clojure(code) {
    var data;
    $.ajax({
        url: "eval.json",
        data: { expr : code },
        async: false,
        success: function(res) { data = res; }
    });
    return data;
}

function html_escape(val) {
    var result = val;
    result = result.replace(/\n/g, "<br/>");
    result = result.replace(/[<]/g, "&lt;");
    result = result.replace(/[>]/g, "&gt;");
    return result;
}

function doCommand(input, report) {
    switch (input) {
    case 'tutorial':
        showPage(0);
        report();
        return true;
    case 'back':
        if (currentPage > 0) {
            showPage(currentPage - 1);
            report();
            return true;
        } else {
            return false;
        }
    case 'next':
        if (currentPage >= 0 && currentPage < pages.length - 1) {
            showPage(currentPage + 1);
            report();
            return true;
        } else {
            return false;
        }
    case 'restart':
        if (currentPage > 0) {
            showPage(0);
            report();
            return true;
        } else {
            return false;
        }
    default:
        return false;
    }
}

function onValidate(input) {
    return (input != "");
}

function onHandle(line, report) {
    var input = $.trim(line);

    // handle commands
    if (doCommand(input, report)) return;

    // perform evaluation
    var data = eval_clojure(input);

    // handle error
    if (data.error) {
        return [{msg: data.message, className: "jquery-console-message-error"}];
    }

    // handle page
    if (pages[n] && pages[n].verify(data)) {
        showPage(currentPage + 1);
    }

    // display expr results
    return [{msg: data.result, className: "jquery-console-message-value"}];
}

/**
 * This should be called anytime the changer div is updated so it can rebind event listeners.
 * Currently this is just to make the code elements clickable.
 */
function changerUpdated() {
    $("#changer code.expr").each(function() {
        $(this).css("cursor", "pointer");
        $(this).attr("title", "Click to insert '" + $(this).text() + "' into the console.");
        $(this).click(function(e) {
            controller.promptText($(this).text());
            controller.inner.click();
        });
    });
}

var controller;

$(document).ready(function() {
    controller = $("#console").console({
        welcomeMessage:'Give me some Clojure:',
        promptLabel: '> ',
        commandValidate: onValidate,
        commandHandle: onHandle,
        autofocus:true,
        animateScroll:true,
        promptHistory:true
    });

    $("#about").click(setupLink("about"));
    $("#links").click(setupLink("links"));
    $("#home").click(setupLink("home"));

    changerUpdated();
});
