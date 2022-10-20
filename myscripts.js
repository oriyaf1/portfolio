
const sleep = ms => new Promise(r => setTimeout(r, ms));


async function replaceImages(msPerImg, images){
    console.log(images)
    // while (true) {   
        for (let i = 0; i < images.length; i++) {
            images[i].style.display = 'block'
            await sleep(msPerImg);
            images[i].style.display = 'none'
            i == images.length -1 ? i = -1 : null; 
        }
    // }
}

main = () => {
    replaceImages(150, document.getElementById('stack-tab').getElementsByTagName('img'))
}
main();