const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");

async function getDoc( url ){
  const doc = await axios.get(url);
  return doc.data;
}

const workFactory = ( href , image , content ) =>{
    return { href, image, content }
}

const artistFactory = ( url, name, works)=>{
    return { url, name, works }
}

async function getWorks( url ) {
  let d = await getDoc(url)
  
  let { window } = new JSDOM(d)
  
  let arr = Array.from(window.document.querySelectorAll(".list-item"))

  let cleanedWorks = arr.map( ( dom ) =>{
    
    //grab url
    const url = dom.querySelector("a").href;
    //grab image
    const image = dom.querySelector("img").src;
    //text content
    const title = dom.querySelector("em").textContent;
    const year = Array.from(dom.querySelector("p").childNodes)[4].textContent.replace(/\s/g,"");

    return workFactory( `https://www.whitney.org${url}`, image, titleFormat( title, year ) )
  });
  
  return cleanedWorks;
}

const titleFormat = ( title, year ) => { return { title, year } };

async function grabArtists(url){
  let d = await getDoc(url)
  
  let { window } = new JSDOM(d)
  
  let arr = Array.from(window.document.querySelectorAll(".list-item"))

  let artists = arr.map( async ( dom ) =>{
    
    //grab url
    const url = dom.querySelector("a").href;
    //name
    const name = dom.querySelector("strong").textContent;
    //works
    const works = getWorks(`https://www.whitney.org/${url}`);
    
    return artistFactory ( url, name, works );
  });

  let ar2 = await Promise.all( arr.map( async ( dom ) =>{
    const url = dom.querySelector("a").href;
    return getWorks(`https://www.whitney.org/${url}`)
  }) )
  
  return ar2
}

(async ()=> { 
  
  let arr =  await grabArtists("https://www.whitney.org/artists") 
  console.log(JSON.stringify(arr) )
})()
