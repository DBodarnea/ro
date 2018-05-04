if (document.readyState !== 'loading') {
    ready()
} else {
    // the document hasn't finished loading/parsing yet so let's add an event handler
    document.addEventListener('DOMContentLoaded', ready)
}

function ready() {
    let optionsPageObject = document.getElementById("optionsPage");
    document.getElementById("intensify_button").addEventListener('click', (e) => intensify());
    for (let node of document.querySelectorAll('[data-i18n]')) {
        let [text, attr] = node.dataset.i18n.split('|');
        text = chrome.i18n.getMessage(text);
        attr ? node[attr] = text : node.appendChild(document.createTextNode(text));
    }
    optionsPageObject.onload = () => {
        optionsPage = optionsPageObject.contentDocument;
        intensify();
    }
}

function intensify() {
    document.getElementById("intensify_button").classList.add("buttonRunning");

    var canvas = document.getElementById("bitmap");
    if (canvas === null) {
        canvas = document.createElement("canvas");
        canvas.id = "bitmap";
        document.getElementById("center").appendChild(canvas);
    }


    let intense_link = document.getElementById("intensity_link");
    if (intense_link == undefined) {
        intense_link = document.createElement('a');
        intense_link.id = "intensity_link";
        document.getElementById("intensifyImage").appendChild(intense_link);
    }
    let intense_gif = document.getElementById("intensity_image");
    if (intense_gif == undefined) {
        intense_gif = new Image();
        intense_gif.id = "intensity_image";
        intense_link.appendChild(intense_gif);
    }
    var imgCanvas = document.createElement("canvas");
    var imgCtx = imgCanvas.getContext("2d");
    var target = new Image();
    target.onload = () => {
        var img_width  = target.width;
        var img_height = target.height;
        if (optionsPage.getElementById("scaleCheckbox").checked) {
            var max_size = optionsPage.getElementById("max_image_size").value;
            if (max_size) {
                if (img_width > max_size) {
                    let ratio = max_size/img_width;
                    img_width *= ratio;
                    img_height *= ratio;
                }
                if (img_height > max_size) {
                    let ratio = max_size/img_height;
                    img_width *= ratio;
                    img_height *= ratio;
                }
            }
        }
        imgCanvas.width = img_width;
        imgCanvas.height = img_height;
        imgCtx.drawImage(target, 0, 0, img_width, img_height);
        var options = {
            img: imgCanvas,
            ctx: canvas.getContext("2d"),
            magnitude: optionsPage.getElementById("magnitude_range").valueAsNumber,
            font_size: optionsPage.getElementById("font_range").valueAsNumber,
            text: optionsPage.getElementById("text").value,
            text_effect: optionsPage.querySelector('input[name="textRadio"]:checked').id,
            img_output: intense_gif,
            link_to_image: intense_link
        }
        // ugly ugly hack to ensure DOM has had time to render class change...
        setTimeout(()=> {
            if (!create_gif(options)) {
                showError();
            }
        }, 100);
    };
    target.src = localStorage.image;
}

function create_gif(options) {
    var magnitude = options.magnitude || 5;
    let canvas_width = options.img.width - (magnitude * 2);
    let canvas_height = options.img.height - (magnitude * 2);
    if (canvas_width <= 1 || canvas_height <= 1) {
        return false;
    }
    options.ctx.canvas.width = canvas_width;
    options.ctx.canvas.height = canvas_height;
    var encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(20);
    encoder.start();

    var font_size = options.font_size;
    if (options.font_size) {
        options.ctx.font = font_size + "px Impact";
        options.ctx.fillStyle = "White";
        options.ctx.lineWidth = 1;
        options.ctx.strokeStyle = "Black";
        options.ctx.textAlign = "center";
    }
    var gif_data = {
        source_file: options.img,
        magnitude: magnitude,
        text: options.font_size ? options.text : "",
        intensify_text: options.text_effect,
        image_x: [0, 2, 1, 0, 2],
        image_y: [2, 2, 0, 1, 1],
        text_x:  [1, 0, 2, 0, 1],
        text_y:  [1, 2, 0, 2, 2]
    }

    for (var i = 0; i < 5; i++) {
        draw_gif_frame(options.ctx, gif_data, i);
        encoder.addFrame(options.ctx);
        options.ctx.clearRect(0, 0, options.ctx.canvas.width, options.ctx.canvas.height);
    }

    encoder.finish();
    var data_url = "data:image/gif;base64," + encode64(encoder.stream().getData());

    options.img_output.src = data_url;
    options.link_to_image.href = data_url;
    options.link_to_image.download = chrome.i18n.getMessage("outputFileName") + ".gif";

    resetButton();
    options.img_output.width = options.ctx.canvas.width;
    options.img_output.height = options.ctx.canvas.height;
    options.ctx.canvas.width = 0;
    options.ctx.canvas.height = 0;
    return true;
}

function draw_gif_frame(ctx, gif_data, frame) {
    var magnitude = -gif_data.magnitude;
    var image_x = magnitude * gif_data.image_x[frame];
    var image_y = magnitude * gif_data.image_y[frame];
    ctx.drawImage(gif_data.source_file, image_x, image_y);

    if (gif_data.text != "") {
        var text_x = ctx.canvas.clientWidth / 2;
        var text_y = ctx.canvas.clientHeight * 0.98;
        switch (gif_data.intensify_text) {
            case "radioAlong":
            text_x += image_x;
            text_y += image_y;
            break;
            case "radioShake":
            text_x += magnitude * gif_data.text_x[frame];
            text_y += magnitude * gif_data.text_y[frame];
            break;
            case "radioMove":
            text_x += image_x;
            text_y += image_y;
            // intentional fallthrough
            case "radioPulse":
            ctx.font = ctx.font.replace(/\d+px/, parseInt(ctx.font.match(/\d+/)) + 4 + "px");
            break;
            default:
        }
        ctx.fillText(gif_data.text, text_x, text_y);
        ctx.strokeText(gif_data.text, text_x, text_y);
        ctx.fill();
        ctx.stroke();
    }
}

const showError = (msg) => {
    let btn = document.getElementById("intensify_button");
    btn.classList.remove("buttonRunning");
    btn.classList.add("buttonFailed");
}

const resetButton = () => {
    let btn = document.getElementById("intensify_button");
    btn.classList.remove("buttonRunning");
    btn.classList.remove("buttonFailed");
}
