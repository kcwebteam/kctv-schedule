# KCTV schedule

[KCTV schedule](http://www.kingcounty.gov/KCTV/schedule.aspx) on kingcounty.gov

Make sure to include xml2json and Moment.js files:
```
<script type="text/javascript" src="//www.kingcounty.gov/~/media/files/temp/xml2json" charset="UTF-8"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" charset="UTF-8"></script>
```

## Initiate Module
```
$(function(){
  KCTVScheduleWidget.init();
});
```
* Example with options
```
$(function(){
  KCTVScheduleWidget.init({
  headerOn: true, 
  id : '#KCTVSchedule'});
});
```
### Options
- headerOn: true or false, adds a header as found [here](http://www.kingcounty.gov/KCTV/schedule.aspx)
- id: id of the div that holds the schedule
