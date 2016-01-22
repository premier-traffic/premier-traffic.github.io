# premier-traffic.github.io
PREMIER TRAFFIC MANAGEMENT is a specialist traffic management sub-contractor that provides high quality temporary traffic management services to the construction, civil engineering and utilities sector.


# Less
To use less:

```
npm install -g less

cd to site

// compile less to css
lessc bootstrap.less bootstrap.css
```

Pay special attention to less/variables.less

I highly recommend having a look at the less source code to see how it works.

Also, the site isn't using minified css!

So:

```
npm install -g less-plugin-clean-css

$ lessc --clean-css bootstrap.less bootstrap.min.css

```

Then go and change your index.html to point at the minified file instead of the unminified one.
