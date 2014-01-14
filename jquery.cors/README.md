wiser jquery.cors
=================

Installation:

* copy jquery.cors folder to your application root folder
  example:

```
cp src/components/chiropractor/jquery.cors src/ -r
```

* add shim values

```
require.config({
  paths:{
    'chiropractor': '../components/chiropractor/chiropractor',
    'console-shim': '../components/console-shim/console-shim',
    'easyxdm': '../jquery.cors/easyxdm/easyxdm',
    'jquery': '../components/jquery/jquery',
    'jquery.cors': '../jquery.cors',
    'json2': '../components/json2/json2'
  },
  shim: {
    'json2': { exports: 'JSON' },
    'jquery.cors/easyxdm/easyxdm': { exports: 'easyXDM' },
    'easyxdm': {
      deps: ['json2'],
      exports: 'easyXDM'
    },
    'console-shim': { exports: 'console' }
  }
});
```

* overwrite jQuery.ajax

```
require('jquery');
require('jquery.cors/jquery.cors');
```
