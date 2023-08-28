# Where to find the custom MODBUS Function Codes

You can find all MODBUS Custom Codes inside the `extras/argumentMaps/defaults/codes.json` file

# How to define a new custom MODBUS code

The json file contains all codes we can use with the MODBUS Flex-FC node

The layout and description of the `code.json` file is as following

```
{
    //argumentMaps is the object that contains all argument maps
    "argumentMaps": {
        //all codes need to be put inside a UUID Object
        "2813f7a2-40f4-11ee-a078-f7298669a6cf":
        {
            //The Function code itself specified as a hex number. WARN: Do not 
            "fc": "0x01",
            //The name of the function code. Value is used as a label in the dropdown dialog.
            "name": "FC 01h",
            //Short Description of the function code. Again this value is used only as a label in the dropdown dialog
            "shortDesc": "Read Coil(s)",
            //RequestMap - A array containing all necessary fields for the Request of the Function Code
            "requestMap":
            [
                //Define all the request fields as Argument Objects. For more about Argumment Objects see the Section about Argument Objects.
                { "name": "startingAddress", "data": 0, "offset": 0, "type": "uint16be" },
                { "name": "quantityCoils", "data": 8, "offset": 2, "type": "uint16be" }
            ],
            //ResponseMap - A array containing all necessary fields for the Response of the Function Code .
            "responseMap": 
            [
                //Define all response fields as a Argument Object. For more about Argument Objects see the Section about Argument Objects.
                { "name": "byteCount", "data": 0, "offset": 0, "type": "uint8be" },
                { "name": "coilStatus", "data": 0, "offset": 1, "type": "uint8be" }
            ]
        },
        //...
}
```

To add a code to that list you can create a new uuid and add that as a new object into the argumentMaps object. Then fill out the rest of the values
as described in the example above. 

# Argument Objects

`requestMap` and `responseMap` can either be an empty array or they contain a list of Argument Objects.

An argument object is a descriptor taken by the ArgumentMap parser which has important details about the parsed value i.e. it's position in the stream or the size.

The descriptor has the following fields

* Name   - The name of the argument. This field is used by the Response parser for generating a JSON Object with the values mapped to the name of the argument. __(Required)__
* Data   - The value of this field is put into the request stream. Should be set to 0 for the Response Map. __(Required)__
* Offset - The position where the parser should read or write the value into the stream. An offset of zero indicates the first byte after the function code. __(Required)__
* Type   - The Type of the Argument. __(Required)__

The value of the offset field has to be continuous over all argument fields with no gaps in between i.e.

```
    "requestMap":
    [
        //Put a 16bit (2byte) value at position 0
        { "name": "foo", "data": 0, "offset": 0, "type": "uint16be" },
        //EMPTY BYTE at Postion 2
        //Put a 8bit value (1byte) value at position 3
        { "name": "bar", "data": 1, "offset": 3, "type": "uint8be"  },
        
        //Visualization of the Issue:
        // X = EMPTY BYTE
        //STREAM
        //+-------+--+---+---+-+---+
        //|UNIT-ID|FC|FOO|FOO|X|BAR|
        //+-------+--+---+---+-+---+
    ]
```

This will lead to a parser error because of an empty byte on position 2 that is not described by the request map.