const fs = require("fs");
const target = "D:/03_AITOOL/deer-flow/frontend/src/app/workspace/graph-exceptional-field-theory/page.tsx";

let c = "";
const Q = String.fromCharCode(34);
const BT = String.fromCharCode(96);
const D = String.fromCharCode(36);
const LB = String.fromCharCode(123);
const RB = String.fromCharCode(125);
const NL = String.fromCharCode(10);

function a(line) { c += line + NL; }
function q(s) { return Q + s + Q; }
function tl(inner) { return BT + inner + BT; }
function jsx(inner) { return LB + inner + RB; }

// Now build the file line by line
a(q("use client") + ";");
a("");
a("import { useState } from " + q("react") + ";");
a("import {");
a("  Card,");
a("  CardContent,");
a("  CardDescription,");
a("  CardHeader,");
a("  CardTitle,");
a("} from " + q("@/components/ui/card") + ";");
a("import { Tabs, TabsContent, TabsList, TabsTrigger } from " + q("@/components/ui/tabs") + ";");
a("import { Badge } from " + q("@/components/ui/badge") + ";");
a("import { Button } from " + q("@/components/ui/button") + ";");
a("import {");
a("  Select,");
a("  SelectContent,");
a("  SelectItem,");
a("  SelectTrigger,");
a("  SelectValue,");
a("} from " + q("@/components/ui/select") + ";");
a("import { Input } from " + q("@/components/ui/input") + ";");
a("import { Label } from " + q("@/components/ui/label") + ";");
a("import { Separator } from " + q("@/components/ui/separator") + ";");
