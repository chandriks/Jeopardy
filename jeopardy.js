// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
//random categories to be used for each game
let categories = [];

//const URL = 'https://jservice.io';
const NUM_QUESTIONS = 5;
const NUM_CATEGORIES = 6; 



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

/*
From the api, the following params: 
Options:
count(int): amount of categories to return, limited to 100 at a time
offset(int): offsets the starting id of categories returned. Useful in pagination.
*/

async function getCategoryIds() {
    let response = await axios.get('https://jservice.io/api/categories', {
        params: {
            count: "100",
            offset: Math.floor(Math.random() * (500 - 1) + 1)
        }
    });
    
    // using lodash to return NUM_CATEGORIES of random categories from rsponse.data array

    let randomCategories = _.sampleSize(response.data, NUM_CATEGORIES);
    //randomCategories.splice(6,99);
    
    // getting catergory ids from randomCategories
    let cIds = [];
    for (let c of randomCategories){
        cIds.push(c.id);
    }
    //console.log(JSON.stringify(cIds));
    return cIds;  
   
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    // get category data (response) from API, takes category ID
    let response = await axios.get('https://jservice.io/api/category', {
        params: {
            id: catId,
        }
    });
    

    let randomClues = _.sampleSize(response.data.clues, NUM_QUESTIONS);
    //console.log(randomClues);
    
    // creates array of clue objects where each clue has question and answer keys & vals
        let clueArr = [];
        for (let clue of randomClues) {
            let clueObj = {
                question: clue.question,
                answer: clue.answer,
            }
            clueArr.push(clueObj);
            //console.log(JSON.stringify(clueArr));
        };
    // category data object is created with title and clue array to fill the board
    categories.push( {
        title: response.data.title,
        clues: clueArr,
    });
    //console.log(JSON.stringify(categories));
    return categories;
}


/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    let catIds = await getCategoryIds(categories);
    //console.log(JSON.stringify(catIds));
    let tableBody = '<table border=1px>';
          tableBody += '<thead tr>';
        // creating header cells
        for (let id of catIds) {
            let categoryData = await getCategory(id);
            tableBody +='<th>';
            console.log(JSON.stringify(categoryData));
            // !!!!!!!!!unable to access title
            console.log(JSON.stringify(categoryData.title));
            const str = JSON.stringify(categoryData.title);
            tableBody += str;
            tableBody += '</th>';
        }
        tableBody += '</tr /thead>';
        $('#tableDiv').html(tableBody);
        // creating table cells with a question mark initially
        for(let i=0;i<NUM_QUESTIONS;i++) {
            tableBody+='<tr>';
            for(let j=0;j<NUM_CATEGORIES;j++){
                tableBody +='<td id=>';
                tableBody +='?';
                tableBody +='</td>';
            }
            tableBody+='</tr>';
        }
        tableBody+='</table>';
       $('#tableDiv').html(tableBody);

       
}

/*async function fillTable() {
    // take glogal categories and an array of getCategoryIds()
    let catIds = await getCategoryIds(categories);
    // create thead with a tr containing WIDTH*td
    let $topRail = $('.game-board').append("<thead class=\"top-rail\"></thead>");
    let $tableRow = $('.game-board thead').append("<tr></tr>");
    for (let id of catIds) {
        let catData = await getCategory(id);
        $('tr').append(`<td>${catData.title}</td>`)
    }
    $topRail.append($tableRow);

    //create row of question cards from each category
    async function makeQuestionRow(catIDs, nthClue) {
        //go to each id in catIds and pull the Nth clue object inside to populate card
        for (let i = 0; i < catIDs.length; i++) {
            let catData = await getCategory(catIds[i]);
            await $(`tr.${nthClue}`).append(`<td class="col-${nthClue} row-${i}"><div class="null value col-${nthClue} row-${i}">${(nthClue + 1) * 100}</div>
            <div class="question hidden">${catData.clues[nthClue].question}</div>
            <div class="answer col-${nthClue} row-${i} hidden">${catData.clues[nthClue].answer}</div>
                </td >`);
        }

    }
    // // should make a row and give index of nthClue

    for (let rows = 0; rows < NUM_QUESTIONS; rows++) {
        $('.game-board').append(`<tr class="${rows}"></tr>`);
        await makeQuestionRow(catIds, rows);
    }

}*/


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    if (target.tagName.toLowerCase() === "td") {
        let j = parseInt(target.getAttribute("id")[0]);
        let i = parseInt(target.getAttribute("id")[2]);
    
        if (target.innerText === "?") {
          target.innerHTML = `${categories[j].clues[i].question}`;
        } else if (target.innerText === `${categories[j].clues[i].question}`) {
          target.style.backgroundColor = "#28a200";
          target.style.cursor = "default";
          target.innerHTML = `${categories[j].clues[i].answer}`;
        } else {
          return;
        }
    }
}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#tableDiv").empty();
    $("#start").text("Loading...");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    let spinner = $('#spin-container');
    spinner.empty();
    $("#start").text("Restart");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    hideLoadingView();
    fillTable();
    $("td").on("click", function (e) {
        handleClick(e.target);
    });

}

/** On click of start / restart button, set up game. */
$("#start").on("click", async () => {
    setupAndStart();
});


/** On page load, add event handler for clicking clues */
