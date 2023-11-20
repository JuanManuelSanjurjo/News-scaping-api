const PORT = 8000
const express = require("express")
const axios = require("axios")
const cheerio  = require("cheerio")

const app = express()


const papers = [
    {
        name: "infobae",
        url:"https://www.infobae.com/",
        base: "https://www.infobae.com/"
        
    },
    {
        name: "tn",
        url:"https://tn.com.ar/",
        base:"https://tn.com.ar"
    },
    {
        name: "la nacion",
        url:"https://www.lanacion.com.ar/",
        base:"https://www.lanacion.com.ar"
    },
    {
        name: "telam",
        url:"https://www.telam.com.ar/",
        base:"https://www.telam.com.a"
    }
]

const articulos = []

async function scrapeAll(){
    papers.forEach( paper => {
        scrapeData(paper, "", " ", articulos)
    })
}
function scrapeData(paper, section , topic , container) {
    return axios.get(`${paper.url}${section}`)
    .then(response => {
        const page = response.data
        const $ = cheerio.load(page)
        
        $('a', page).filter((i, element) => {
            return $(element).text().toLowerCase().includes(topic);
        }).each((i, element) => {
            const title = $(element).text();
            let url = $(element).attr("href");
            if(!url.startsWith("https")) url = paper.base + url
            
            
            container.push({title, url, source: paper.name });
        });
        
    }).catch(err => console.log(err))
}


app.get("/",  (req, res) => {
    res.json("Welcome to the politics news hub")
})


app.get("/noticias", async (req, res) => {
    await scrapeAll()
    res.json(articulos) 
    
})

app.get("/noticias/:paperName/:section/:topic", async (req, res) => {
    const paperName = req.params.paperName
    const section = req.params.section
    const topic = req.params.topic

    const paper = papers.filter(item => item.name == paperName)
    const articulos = []

    await scrapeData(paper[0], section, topic, articulos)
    
    if(articulos.length != 0){
        res.json(articulos) 
    }else{
        res.json("No results for this query")
    }

})








app.listen(PORT, () => console.log("server running on port" + PORT))


 