$( document ).ready(function() {
    $(':file').on('fileselect', function(event, numFiles, label) {

          var input = $(this).parents('.input-group').find(':text'),
              log = numFiles > 1 ? numFiles + ' files selected' : label;

          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }

      });

    $(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
    });

    //check file extension on upload
    $('#csvFile').change(function(e) {
        //clear out the results
        $('#results').text("");
        var ext = this.value.split(".");

        if( ext.length === 1 || ( ext[0] === "" && ext.length === 2 ) ) {
            alert('Only CSV files are allowed to be uploaded.');
            //disable all controls if not CSV
            this.value='';
            $('#csvControls').hide();
            $('#createcsv').prop('disabled',true);
            return;
        }
        else {
            ext = ext.pop();
        }

        switch(ext)
        {
            case 'csv':
                //if it is a csv, determine how many columns it has
                //then add available columns to dropdown
                //and show all controls
                if (e.target.files != undefined) {

                    //first set the filename text to the label next to the upload button
                    //$('#fname').html(e.target.files[0].name);
                    var r = new FileReader();

                    r.onload = function (e) {
                        var csvArray = CSVToArray(e.target.result);
                        var hashTable = {};

                        if (csvArray === null || csvArray.length < 1 || csvArray[0].length < 1)
                        {
                            alert('Could not find any data in the csv. Aborting analysis.');
                            return;
                        }

                        for (var i = 0; i < csvArray.length; i++)
                        {
                            hashTable[csvArray[i][0]] = 1;
                        }

                        for (var i = 0; i < csvArray.length; i++)
                        {
                            if (hashTable[csvArray[i][1]] === 2)
                            {
                                $('#results').append("<p>" + "Duplicate Value Found in Column 2: " + csvArray[i][1] + "</p>");
                            }
                            else if (hashTable[csvArray[i][1]] !== 1)
                            {
                                $('#results').append("<p>" + "Missing Value Found in Column 2: " + csvArray[i][1] + "</p>");
                            }
                            else
                            {
                                hashTable[csvArray[i][1]] += 1;
                            }
                        }
                        $('#results').append("<p>Finished Analyzing CSV</p>");
                    };
                    r.readAsText(e.target.files[0]);
                    $('#csvControls').show();
                    $('#createcsv').prop('disabled',false);
                }
                break;
            default:
                //disable all controls if not CSV
                alert('Only CSV files are allowed to be uploaded.');
                this.value='';
                $('#fname').val("");
        }
    });

    // ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }
});