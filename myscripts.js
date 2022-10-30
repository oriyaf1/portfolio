
const sleep = ms => new Promise(r => setTimeout(r, ms));


async function replaceImages(msPerImg, images) {
    console.log(images)
    // while (true) {   
    for (let i = 0; i < images.length; i++) {
        images[i].style.display = 'block'
        await sleep(msPerImg);
        images[i].style.display = 'none'
        i == images.length - 1 ? i = -1 : null;
    }
    // }
}
async function typeText(div, text, classList = [], speed = 100, onCompletion = (span) => null) {
    let span = document.createElement("span");
    let blinkMarker = document.createElement("span");
    blinkMarker.classList.add(['blinkMarker'])
    blinkMarker.innerText = '|'
    div.appendChild(span);
    div.appendChild(blinkMarker)
    for (const c of classList) {
        span.classList.add(c)
    }
    for (let i = 0; i < text.length; i++) {
        let letter = text[i];
        let substring = text.substring(0, i + 1);
        setTimeout(() => {
            span.innerText = substring;
            if (substring == text) {
                blinkMarker.remove();
                onCompletion(span)
            }
        }, speed * (i + 1));
    }
    return span;
}


let zoomControl = {
    svg: null,
    windowRectViewBox: null,
    houseViewBox: null,
    smokeArea: null,
    windowShutter: null,
    windowShutterOpts: {
        open: '90',
        close: '215',
    },
    startSmokePosition: {
        x: 0,
        y: 0,
    },
    rootViewBox: [0, 0, 0, 0],
    zoopRequest: null,
    viewBox: [0, 0, 0, 0],
    zoomUnitBox: [0, 0, 0, 0],
    currentMode: 'viewWallpaper',
    modeOpts: {
        house: 'house',
        viewWallpaper: 'viewWallpaper',
        tank: 'tank',
    },
    openScreenViewBox: null,
    isIdeOpen: false,
};
const setZoomUnixBox = (fromBox, toBox, scrollUnit = 1) => {
    zoomControl.zoomUnitBox = [];
    for (let i = 0; i < fromBox.length; i++) {
        if (fromBox[i] > toBox[i])
            zoomControl.zoomUnitBox.push((fromBox[i] - toBox[i]) / scrollUnit)
        else
            zoomControl.zoomUnitBox.push((toBox[i] - fromBox[i]) / scrollUnit)
    }
}

const zoom = async (zoomUnits, svg) => {

    zoomControl.viewBox = zoomControl.svg.getAttribute('viewBox').split(' ').slice(0, 4).map(x => parseFloat(x));

    zoomControl.viewBox[0] = zoomControl.viewBox[0] + (zoomControl.zoomUnitBox[0] * zoomUnits)
    zoomControl.viewBox[1] = zoomControl.viewBox[1] + (zoomControl.zoomUnitBox[1] * zoomUnits)
    zoomControl.viewBox[2] = zoomControl.viewBox[2] - (zoomControl.zoomUnitBox[2] * zoomUnits)
    zoomControl.viewBox[3] = zoomControl.viewBox[3] - (zoomControl.zoomUnitBox[3] * zoomUnits)

    svg.setAttribute('viewBox', zoomControl.viewBox.join(' '))

}
const animateWindow = (dir) => {
    zoomControl.windowShutter.setAttribute('height', zoomControl.windowShutterOpts[dir]);
}
const isAllowedZoom = (zoomUnit) => {
    console.log(zoomControl.isIdeOpen, zoomUnit)
    if (zoomControl.isIdeOpen && zoomUnit > 0){

        return false;
    }
    if (zoomControl.houseViewBox[0] < zoomControl.viewBox[0]) {
        if (zoomControl.openScreenViewBox[0] < zoomControl.viewBox[0]) {
            document.getElementById('ide').style.display = 'block';
            zoomControl.isIdeOpen = true;
            let div = document.getElementById('code-area')
            div.innerHTML = ''
            setInterval(() => {
                if (zoomControl.isIdeOpen == true)
                    typeText(div, "מה אומר ?", ['code'], (span) => {null})
            }, 500);
        }
        else {
            zoomControl.isIdeOpen = false;
            document.getElementById('ide').style.display = 'none';
        }
        if (zoomControl.currentMode != zoomControl.modeOpts.house) {
            zoomControl.currentMode = zoomControl.modeOpts.house;
            animateWindow(dir = 'open');
        };
    }
    else {
        if (zoomControl.currentMode != zoomControl.modeOpts.viewWallpaper) {
            zoomControl.currentMode = zoomControl.modeOpts.viewWallpaper;
            animateWindow(dir = 'close');
        }
    }
    return true;
}

const animateZoom = async (event) => {
    setZoomUnixBox(zoomControl.svg.getAttribute('viewBox').split(' ').slice(0, 4)
        .map(x => parseFloat(x)),
        zoomControl.windowRectViewBox);
    let scroll = event.deltaY;
    let dir = scroll / Math.abs(scroll);
    for (let i = 0; i < Math.abs(scroll); i = i + 10) {
        let zoomUnit = 15 / 3000 * dir;
        if (!isAllowedZoom(zoomUnit))
            return;
        window.requestAnimationFrame(() => {
            zoom(zoomUnit, zoomControl.svg);
        });
        await sleep(25);
    }
}


const addWrodToSmoke = (word) => {
    let newWord = zoomControl.svg.getElementById('123').cloneNode(true);
    let tspan = document.createElement('tspan');
    tspan.setAttribute('x', zoomControl.startSmokePosition.x);
    tspan.setAttribute('y', zoomControl.startSmokePosition.y);
    tspan.textContent = word;
    newWord.innerHTML = '';
    newWord.appendChild(tspan);
    newWord.setAttribute('id', word)
    zoomControl.smokeArea.appendChild(newWord);
    return newWord;
}

const initZoomControl = () => {
    zoomControl.svg = document.getElementById('wallpaper-img')
        .contentDocument.getElementsByTagName('svg')[0];
    let windowRect = zoomControl.svg.getElementById("window-rect");
    zoomControl.windowShutter = zoomControl.svg.getElementById("window-shutter");
    zoomControl.windowRectViewBox = [
        parseFloat(windowRect.getAttribute('x')),
        parseFloat(windowRect.getAttribute('y')),
        parseFloat(windowRect.getAttribute('width')),
        parseFloat(windowRect.getAttribute('height'))
    ];
    let houseRect = zoomControl.svg.getElementById("house-rect");
    zoomControl.houseViewBox = [
        parseFloat(houseRect.getAttribute('x')),
        parseFloat(houseRect.getAttribute('y')),
        parseFloat(houseRect.getAttribute('width')),
        parseFloat(houseRect.getAttribute('height'))
    ];
    let openScreenRect = zoomControl.svg.getElementById("open-screen-rect");
    zoomControl.openScreenViewBox = [
        parseFloat(openScreenRect.getAttribute('x')),
        parseFloat(openScreenRect.getAttribute('y')),
        parseFloat(openScreenRect.getAttribute('width')),
        parseFloat(openScreenRect.getAttribute('height'))
    ];
    zoomControl.svg.getElementById("screen").addEventListener('click', (e) => {
    });
}

const startSmokeWords = async () => {
    zoomControl.smokeArea = zoomControl.svg.getElementById("smoke-area");
    let tspan = zoomControl.svg.getElementById('for').getElementsByTagName('tspan')[0]
    zoomControl.startSmokePosition = {
        x: tspan.getAttribute('x'),
        y: tspan.getAttribute('y'),
    }
    // addWrodToSmoke('test');
}

main = () => {
    initZoomControl();
    startSmokeWords();

    // setZoomUnixBox(zoomControl.svg.getAttribute('viewBox').split(' ').slice(0, 4)
    //     .map(x => parseFloat(x)),
    //     targetViewBox);
    window.addEventListener('wheel', async (event) => {
        animateZoom(event);
    })

    replaceImages(150, document.getElementById('stack-tab').getElementsByTagName('img'))
}

addEventListener('load', (event) => main());