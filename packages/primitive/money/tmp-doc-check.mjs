import { Money, Monetary, Rounding } from "./dist/index.js";

const round = Rounding.currencyDefault();
const p = (l, v) => console.log(l, "=>", String(v));

p("KWD digits", Monetary.getCurrency("KWD").defaultFractionDigits);
p("1.23456 KWD", Money.of("1.23456", "KWD").with(round));
p("1500.6 JPY", Money.of("1500.6", "JPY").with(round));
p("1.3993 USD", Money.of("1.3993", "USD").with(round));
p("ctx 1.3993", JSON.stringify(Money.of("1.3993", "USD").getContext()));
p("1.50 UNNECESSARY", Money.of("1.50", "USD").roundTo(2, "UNNECESSARY"));
p("1.5 to 3 UNNECESSARY", Money.of("1.5", "USD").roundTo(3, "UNNECESSARY"));

// allocate details
p("0.07 allocate 5", Money.of("0.07", "USD").allocate(5).map(String).join(" | "));
p("100 ratios 1,1,1", Money.of("100.00", "USD").allocateByRatios([1, 1, 1]).map(String).join(" | "));
p("10 ratios 0.5,0.25,0.25", Money.of("10.00", "USD").allocateByRatios([0.5, 0.25, 0.25]).map(String).join(" | "));
p("-10 allocate 3", Money.of("-10.00", "USD").allocate(3).map(String).join(" | "));
p("-10 sum", String(Money.sum(Money.of("-10.00", "USD").allocate(3), "USD")));
p("10.005 allocate 2", Money.of("10.005", "USD").allocate(2).map(String).join(" | "));
p("10.015 allocate 2", Money.of("10.015", "USD").allocate(2).map(String).join(" | "));
p("10.005 HALF_UP then allocate", Money.of("10.005", "USD").roundTo(2, "HALF_UP").allocate(2).map(String).join(" | "));
try { Money.of("10.00", "USD").allocate(0); } catch (e) { p("allocate(0)", `${e.name}: ${e.message}`); }
try { Money.of("10.00", "USD").allocate(2.5); } catch (e) { p("allocate(2.5)", `${e.name}: ${e.message}`); }
try { Money.of("10.00", "USD").allocateByRatios([]); } catch (e) { p("allocate([])", `${e.name}: ${e.message}`); }
p("1000 ratio 1,1,1", Money.of("1000.00", "USD").allocateByRatios([1, 1, 1]).map(String).join(" | "));
p("0.03 allocate 4", Money.of("0.03", "USD").allocate(4).map(String).join(" | "));
p("JPY 1000 ratios 1,1,1", Money.of("1000", "JPY").allocateByRatios([1, 1, 1]).map(String).join(" | "));

// conversion details
import { Conversion } from "./dist/index.js";
p("JPY term from USD", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "JPY", factor: "151.35" })));
p("IDR digits", Monetary.getCurrency("IDR").defaultFractionDigits);
p("USD->IDR 15000", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "IDR", factor: "15000" })));
p("USD->IDR 15234.5678", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "IDR", factor: "15234.5678" })));
p("rate obj", JSON.stringify(Conversion.of({ base: "USD", term: "EUR", factor: 0.92 }).rate));
p("factor number 0.92 ok", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "EUR", factor: 0.92 })));
try { Conversion.of({ base: "USD", term: "EUR", factor: "-1" }); } catch (e) { p("neg factor", `${e.name}: ${e.message}`); }
try { Money.of("100.00", "USD").with(Conversion.of({ base: "EUR", term: "USD", factor: "1.08" })); } catch (e) { p("base mismatch", `${e.name}: ${e.message}`); }
p("USD->USD", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "USD", factor: "1.5" })));
p("rounding mode arg", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "EUR", factor: "0.92555" }, "DOWN")));
p("rounding default", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "EUR", factor: "0.92555" })));
Monetary.registerCurrency({ currencyCode: "XPT", numericCode: 0, defaultFractionDigits: -1 });
p("term scale -1 keeps precision", Money.of("100.00", "USD").with(Conversion.of({ base: "USD", term: "XPT", factor: "0.0000123456789" })));
p("chain trip", Money.of("100.00", "EUR")
  .with(Conversion.of({ base: "EUR", term: "USD", factor: "1.0850" }))
  .with(Conversion.of({ base: "USD", term: "EUR", factor: "0.92166" })));
p("JPY 1 -> USD 0.0066", Money.of("1", "JPY").with(Conversion.of({ base: "JPY", term: "USD", factor: "0.0066" })));
p("JPY 1000000 -> USD", Money.of("1000000", "JPY").with(Conversion.of({ base: "JPY", term: "USD", factor: "0.0066" })));
p("USD 6600 -> JPY", Money.of("6600.00", "USD").with(Conversion.of({ base: "USD", term: "JPY", factor: "151.5151515" })));
