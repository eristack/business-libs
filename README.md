# EriStack Business Primitives Library

Eristack Business Primitives — a TypeScript monorepo for shared business primitives library.

## Story behind EriStack Business Primitives

Node ecosystem lacks the proper enterprise support like Java or C# environment. This pain is especially known to us, as we, at the [Erista](https://github.com/erista), struggles with reusability of so many important and what is supposed to be consistent business primitives.

EriStack aims to fill these gaps by implementing some of the well-known enterprise support on business primitives such as: Date, Money (JSR 354 on Java), Document Number, etc.

## Packages

- [`@eristack/money`](./packages/money) — JSR 354–inspired money primitives (see [`packages/money/docs`](./packages/money/docs))
