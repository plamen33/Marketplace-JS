class ChartView {
    constructor(wrapperSelector, mainContentSelector) {
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    }

    // showPostDetails(post) { //Show the article which we want to see (incl. all comments)
    //     let thisClass = this;
    //     let postData = {
    //         postDetails: post,  // this what we pass to the view
    //         postComments: post['commentsList']   // future implementation
    //     };
    //     $.get('templates/details-post.html', function (template) {
    //         var renderMainContent = Mustache.render(template, postData);
    //         $(thisClass._mainContentSelector).html(renderMainContent);
    //     });
    // }

     showSalesChart(recentPosts){
         let thisClass = this;
         console.log("showSalesChart in the View");
         console.log(recentPosts);
             let postData = {
                 postDetails: recentPosts[0]
                 // this what we pass to the view
             };
         $.get('templates/sales-chart.html', function (template) {

             var renderMainContent = Mustache.render(template, postData);
             $(thisClass._mainContentSelector).html(renderMainContent);

             let labelTagOne = "";
             let labelTagTwo = "";
             let labelTagThree = "";
             let labelsSet = new Set(); // prepare Set for label tag names
             let dateSet = new Set(); // prepare Set for dates
             for(let post of recentPosts){
                 labelsSet.add(post.tag);
                 dateSet.add(post.date);
             }
             let labels = Array.from(labelsSet).sort((labelOne, labelTwo)=> labelOne.localeCompare(labelTwo)); // sort Alphabetically label tag names
             labelTagOne = labels[0];
             labelTagTwo = labels[1];
             labelTagThree = labels[2];
             let datesArray = []; // prepareArray with moment dates objects
             for(let date of dateSet){
                 datesArray.push(moment(date, 'MMMM Do YYYY')); // parse each date to moment js date object, which is in the format example: March 27th 2018
             }
             let datesTemp = datesArray.sort((a,b) => a>b); // prepare temp array with sorted moment dates objects in ascending order
             let dates = []; // prepare final array with dates string
             datesTemp.forEach(date => dates.push(date.format('DD-MM-YYYY'))); // format each date and add to the dates array, as a String

             let salesArrayTagOne = [];
             let salesArrayTagTwo = [];
             let salesArrayTagThree = [];
             for(let date of dates){
                 let dateMoment = moment(date, 'DD-MM-YYYY');
                 console.log("dateMoment " + dateMoment);
                 let intTagOne = 0;
                 let intTagTwo = 0;
                 let intTagThree = 0;
                 for(let post of recentPosts){
                   let datePostMoment =  moment(post.date, 'MMMM Do YYYY');
                     console.log("datePostMoment "+datePostMoment);
                   if(dateMoment.isSame(datePostMoment)){
                       console.log("we have equal dates");
                       console.log(post.title);
                       if(post.tag == labelTagOne){
                           intTagOne++;
                       } else if(post.tag == labelTagTwo){
                           intTagTwo++;
                       } else if(post.tag == labelTagThree){
                           intTagThree++;
                       }
                   }
                 }
                 salesArrayTagOne.push(intTagOne);
                 salesArrayTagTwo.push(intTagTwo);
                 salesArrayTagThree.push(intTagThree);
             }
             console.log(salesArrayTagOne);
             console.log(salesArrayTagTwo);
             console.log(salesArrayTagThree);

             let datasetsArrayOfObjects = [];
             if(labelTagOne!= undefined){
                 datasetsArrayOfObjects.push(
                     {
                         label:  labelTagOne,
                         backgroundColor: "#f5e39a",
                         data: salesArrayTagOne
                     }
                 );
             }
             if(labelTagTwo!= undefined){
                 datasetsArrayOfObjects.push(
                     {
                         label: labelTagTwo,
                         backgroundColor: "#6ceb7a",
                         data: salesArrayTagTwo
                     }
                 );
             }
             if(labelTagThree!= undefined){
                 datasetsArrayOfObjects.push(
                     {
                         label: labelTagThree,
                         backgroundColor: "#58d8b2",
                         data:  salesArrayTagThree
                     }
                 );
             }

             new Chart(document.getElementById("bar-chart-grouped"), {
                 type: 'bar',
                 data: {
                     labels: dates,
                     datasets: datasetsArrayOfObjects
                 },
                 options: {
                     title: {
                         display: true,
                         text: 'Daily sales by category tag :'
                     }
                 }
             }); // end of new Chart
         }); // end of sales-chart.html

     }
}

/// fake working - static Chart showing
// showSalesChart(recentPosts){
//     let thisClass = this;
//     console.log("showSalesChart in the View");
//     console.log(recentPosts);
//     let postData = {
//         postDetails: recentPosts,  // this what we pass to the view
//     };
//     $.get('templates/sales-chart.html', function (template) {
//
//         var renderMainContent = Mustache.render(template, postData);
//         $(thisClass._mainContentSelector).html(renderMainContent);
//
//         new Chart(document.getElementById("bar-chart-grouped"), {
//             type: 'bar',
//             data: {
//                 labels: ["1900", "1950", "1999", "2050"],
//                 datasets: [
//                     {
//                         label: "Africa",
//                         backgroundColor: "#3e95cd",
//                         data: [133,221,783,2478]
//                     }, {
//                         label: "Europe",
//                         backgroundColor: "#8e5ea2",
//                         data: [408,547,675,734]
//                     }
//                 ]
//             },
//             options: {
//                 title: {
//                     display: true,
//                     text: 'Population growth (millions)'
//                 }
//             }
//         });
//
//
//
//     });
//
// }

