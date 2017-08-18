var dom = document.getElementById("container");
var myChart = echarts.init(dom);
var app = {};
var $ = document.querySelector.bind(document);
var CONSOLE = $("#console");
option = null;
function getVirtulData(year) {
    year = year || '2017';
    var date = +echarts.number.parseDate(year + '-01-01');
    var end = +echarts.number.parseDate((+year + 1) + '-01-01');
    var dayTime = 3600 * 24 * 1000;
    var data = [];
    for (var time = date; time < end; time += dayTime) {
        data.push([
            echarts.format.formatTime('yyyy-MM-dd', time),
            Math.floor(Math.random() * 1000)
        ]);
    }
    return data;
}



option = {
    tooltip: {
        position: 'top'
    },
    visualMap: {
        min: 0,
        max: 1000,
        type: 'piecewise',
        splitNumber: 5,
        color: ['#d94e5d','#eac736','#50a3ba'],
        textStyle: {
            color: '#000'
        },
        orient: 'horizontal',
        left: 'center',
        top: 'top'
    },

    calendar: [
        {
            range: '2017',
            cellSize: ['auto', 20]
        }],

    series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        calendarIndex: 0,
        data: getVirtulData(2017)
    }]

};

myChart.on("click", function(e){
  console.log("....",e.data[0]);
  console.log("....",CONSOLE);
    CONSOLE.innerHTML = e.data[0]
});

if (option && typeof option === "object") {
    myChart.setOption(option, false);
}