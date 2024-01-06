This is a very simple library for accessing [ArangoDB](https://arangodb.com/)
from [Deno](https://deno.com/).

It depends on [djwt](https://deno.land/x/djwt/).

The library is a very thin layer on top of the raw http-based API of Arango.
Usage is as follows:

```
import { Arango } from "https://github.com/nstevensdc/deno-arango/raw/master/mod.js"

const arango = new Arango("http://arangoserver:8529", "root", "mysecurepassword")
await arango.createDatabase("mygreatdb")
arango.selectDatabase("mygreatdb")
await arango.query("/_api/collection", "POST", { name: "widgets" })
await arango.execute('INSERT { name: "Foo", price: 9.95 } INTO widgets')
await arango.execute('INSERT { name: "Bar", price: 19.95 } INTO widgets')
await arango.execute('INSERT { name: "Baz", price: 39.95 } INTO widgets')
await arango.execute('FOR w in widgets FILTER w.price < 20 RETURN w')
```

This returns the Foo and Bar records in an array.
