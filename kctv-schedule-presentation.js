
<script type="text/javascript">*/
var KCTVScheduleWidget = (function ($) {
  'use strict';

  var settings = {
    xml : '', //XML file 
    id : '#KCTVSchedule',
    activeDay : getActiveDay('day'), //if testing use format mm/dd/yyyy
    earliestEvent : new Date(),
    latestEvent : new Date ('1/1/2000'),
    headerOn : true
  };


  //Init function
  function init(options) {
    // copy properties of `options` to `config`. Will overwrite existing ones. http://stackoverflow.com/questions/6504726/how-can-i-pass-parameters-to-a-module-pattern-to-override-default-values-privat
    for(var prop in options) {
        if(options.hasOwnProperty(prop)){
            settings[prop] = options[prop];
        }
    }
    //getXML('/~/Globals/feeds/kctv-schedule.aspx');
    getXML('/Globals/feeds/kctv-schedule.aspx');
    //getXML('EPG15102014.xml'); //http://edit.kingcounty.gov/Globals/feeds/kctv-schedule.aspx
    //bindUI(settings.activeDay);
  }

  //Bind to UI
  function bindUI(activeDay) {
    var jsonData = convertXMLtoJSON(settings.xml);
    var table = parseData(jsonData, settings.activeDay);
    var header = (settings.headerOn) ? formatHeaderNav(activeDay) : ""; //If headerOn is false, no header

    $(settings.id).html(header + table);
  }

  //Get XML source
  function getXML(URL) {
    var data = "";
    var jqXHR = $.ajax({
      type: "GET",
      url: URL,
      //processData: false,
      crossDomain: true,
      dataType: "xml",
      //data: xmlDocument
      success: function(xml) {
        settings.xml = xml;
        bindUI(settings.activeDay);
        return data;
    },
      error: function(jqxhr, errorType, obj) {
        console.log(errorType + obj);
      }
    });
      
    jqXHR.done(function( xml ) {
      data = xml;
      //console.log(xml);
    });
    
    jqXHR.fail(function( jqXHR, textStatus ) {
      console.log("Request failed: " + textStatus + jqXHR.status);
    });

    return data;
  }
  //Convert XML to JSON
  function convertXMLtoJSON(data) {
    //Create x2js instance with default config
    var x2js = new X2JS();
    //var jsonObj = x2js.xml_str2json(data);
    var jsonObj = x2js.xml2json(data);
    return jsonObj;
  }

  //Format header based on active date
  function formatHeaderNav(activeDay) {
    //Set dates
    var d = new Date(activeDay);

    var dayOfWeek = d.getDay();
    var previousWeek = new Date();
    var nextWeek = new Date();
    var prevLink = "";
    var nextLink = "";
    
    //previousWeek.setTime(d.getTime() - ((24*60*60*1000) * 7));
    //nextWeek.setTime(d.getTime() + ((24*60*60*1000) * 7));

    previousWeek = addDays(d, -7);
    nextWeek = addDays(d, 7);

    var today = new Date();

    today.setHours('00');
    today.setMinutes('00');
    today.setSeconds('00');
    today.setMilliseconds('00');

    //console.log(settings.earliestEvent.valueOf(), addDays(d, -dayOfWeek).valueOf() , addDays(d, 6 - dayOfWeek).valueOf());
    //console.log(settings.latestEvent.valueOf(), previousWeek.valueOf());
    
    //if earliest event is before this sun
    if (settings.earliestEvent.valueOf() < addDays(d, -dayOfWeek).valueOf()) {
      prevLink ='<a href="?day='+previousWeek.toLocaleDateString()+'">Previous Week</a>';
    }
    
    //if latest event is greater than this sat, show next week
    if (settings.latestEvent.valueOf() > addDays(d, 6 - dayOfWeek).valueOf()) {
      nextLink = '<a href="?day='+ nextWeek.toLocaleDateString() +'">Next Week</a>';
    }

    var html = '<div class="schednav_ng"><div class="tvweeks_ng"><div class="column_ng prev_ng ">'+prevLink+'</div><div class="column_ng tvdate_ng">'+getDayOfWeek(dayOfWeek) + ' - ' + d.toLocaleDateString()+ '</div><div class="column_ng next_ng">'+nextLink+'</div></div><div class="clear"></div><ul class="tvweekdays_ng">';
    //Get days of week links, starts on sun
    var i;
    for (i = 0; i < 7; i+=1) {
      html += formatDay(i, dayOfWeek);
    }
    //Close ul,div
    html += '</ul></div>';
    
    return html;
    //Function to format HTML for links
    function formatDay (indexDayofWeek, activeDayofWeek) {
      var link = '';
      var indexDate = new Date();
        
      //indexDate.setDate(d.getDate() + indexDayofWeek - activeDayofWeek);
      indexDate = addDays(d, indexDayofWeek - activeDayofWeek);

      if (indexDayofWeek === activeDayofWeek) {
        link = getDayOfWeek(activeDayofWeek);
      } else {
        link = '<a href="?day=' + indexDate.toLocaleDateString() + '">' + getDayOfWeek(indexDayofWeek) + '</a>';
      }
      return '<li>' + link + '</li>';
    }

    function showPrevLink(schedule) {
       //Start loop through data
      for(var i= 0; i < schedule.tv.programme.length; i=i+1) {

      }
    }
  }

  //Parse the table
  function parseData (data, activeDay) {
    var html = "";
    var title;
    var noSchedule = true;

    //Set dates
    var today = new Date(activeDay);
    var todayDate = today.toLocaleDateString(); // 01/01/2014
    var dayOfWeek = getDayOfWeek(today);
    var currentMonth = getCurrentMonth(today);


    html += '<table id="tvschedule" border="0" cellpadding="0" class="datatable tvsched_ng" summary="King County Television Schedule">';
    html += (!settings.headerOn) ? '<caption class="noHeader">': '<caption>'; //if no header, add class noHeader to cpation
    html += 'What\'s on today: ' + dayOfWeek +', '+ currentMonth +' '+ today.getDate() +'</caption>';
    html += '<thead><tr>';
    html += '<th scope="cols" class="airtime_ng">Time</th><th scope="cols" class="title_ng">Title</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    html += (!settings.headerOn) ? '<tr id="tvschedscroll" class="tvschedscroll_g">' : "";
    
    var startDateFull; //Friday, October 17
    var startTime; // 12:00 a.m.
    
    //Start loop through data
    for(var i= 0; i < data.tv.programme.length; i=i+1) {
      //Check to see if the programme time is less than 10 minutes
      if (diffTime(data.tv.programme[i]._start, data.tv.programme[i]._stop) < 600000){
        continue;
      }
      
      //Set title
      title = data.tv.programme[i].title;

      //Get date data
      var dd = data.tv.programme[i]._start.slice(6,8);
      var mm = data.tv.programme[i]._start.slice(4,6);
      var yyyy = data.tv.programme[i]._start.slice(0,4);


      //try moment datetime
      //add 1 second to round up to correct time
      var startTime = moment(data.tv.programme[i]._start, "YYYYMMDDHHmmss").add(1,'seconds').format("LT"); 


      //Format startTime to show am/pm
      //startTime = new Date(data.tv.programme[i]._start.replace(
      //  /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
      //  '$4:$5:$6 $2/$3/$1'));
      //startTime = formatAMPM(startTime);


      //Create date without time data, for comparison
      var startDate = new Date(yyyy, mm-1, dd);
      var todayDateSansTime = new Date(today);
      todayDateSansTime.setHours(0,0,0,0);

      //Only Show for today/active date
      if(startDate.valueOf() === todayDateSansTime.valueOf()){
        //Add odd class to odd rows
        html += (i % 2 === 0) ? '<tr>' : '<tr class="odd">';

        html += '<td class="airtime_ng">'+ startTime +'</td>';
        html += '<td class="title_ng">'+ title +'</td>';
        html += '</tr>';
        noSchedule = false;
      }

      //get earliest event in schedule
      if (startDate.valueOf() < settings.earliestEvent.valueOf())
      {
        settings.earliestEvent = startDate;
      }

      //get latest event in schedule
      if (startDate.valueOf() > settings.latestEvent.valueOf()) {
        settings.latestEvent = startDate;
      }
        
    }

    //End for loop
    if(noSchedule) {
      html += '<tr><td>Schedule Currently Not Available</td><td></td></tr>';
    }
    html += (!settings.headerOn) ? '</tr>' : '';
    html += '</tbody><tfoot><tr>';
    html += '<td colspan="2">Schedules subject to change, depending on the length of live programming.</td>';
    html += '</tr></tfoot>';

    html += '</table>';
    html += (!settings.headerOn) ? '<div class="tvschedlinks_g"><a href="/KCTV/schedule.aspx">Search TV Schedule</a></div>' : '';
    return html;
  }
  function diffTime(start, end){
    var diff;

    //Get date data
    var dd1 = start.slice(6,8);
    var mm1 = start.slice(4,6);
    var yyyy1 = start.slice(0,4);
    var h1 = start.slice(8,10);
    var m1 = start.slice(10,12);
    var s1 = start.slice(12,14);

    var dd2 = end.slice(6,8);
    var mm2 = end.slice(4,6);
    var yyyy2 = end.slice(0,4);
    var h2 = end.slice(8,10);
    var m2 = end.slice(10,12);
    var s2 = end.slice(12,14);

    var dateStart = new Date();
    var dateEnd = new Date();
    dateStart.setFullYear(yyyy1);
    dateStart.setMonth(mm1-1);
    dateStart.setDate(dd1);
    dateStart.setHours(h1);
    dateStart.setMinutes(m1);
    dateStart.setSeconds(s1);

    dateEnd.setFullYear(yyyy2);
    dateEnd.setMonth(mm2-1);
    dateEnd.setDate(dd2);
    dateEnd.setHours(h2);
    dateEnd.setMinutes(m2);
    dateEnd.setSeconds(s2);

    diff = (dateEnd - dateStart);
    return diff;
  }
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = (hours < 10) ? ('0' + hours) : hours; //leading 0 
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  function getActiveDay(param) {
    var today = (new Date()).toLocaleDateString();
    return ((typeof getParameterByName(param) === "undefined") || (getParameterByName(param) === "")) ? today : getParameterByName(param);
  }
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  function getDayOfWeek(day) {
      //Get day of week
    var weekday = new Array(7);
    weekday[0]=  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return (typeof day === 'number') ? weekday[day] : weekday[day.getDay()];
  }

  function getCurrentMonth(day) {
    //Get Month
    var month = [];
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    return  month[day.getMonth()];
  }

  //http://stackoverflow.com/questions/6963311/add-days-to-a-date-object
  function addDays(oldDate, days) {
    var newDate = new Date();
    newDate.setTime( oldDate.getTime() + days * 86400000 );
    return newDate;
  }

  return {
    init: init
  };
})(jQuery);


 //Initiate Module
$(function(){
  KCTVScheduleWidget.init({headerOn: true, id : '#KCTVSchedule'});
});

/*</script>*/