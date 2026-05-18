import base64, os
Q = chr(34)
NL = chr(10)
LB = chr(123)
RB = chr(125)
BT = chr(96)
DL = chr(36)
lines = []
def a(s): lines.append(s)
def q(s): return Q + s + Q
def jsx(s): return LB + s + RB
def tl(s): return BT + s + BT
def dol(s): return DL + s

a(""use client"" + ";")
a("")
a("import { useState } from " + q("react") + ";")
a("import {")
a("  Card,")
a("  CardContent,")
a("  CardDescription,")
a("  CardHeader,")
a("  CardTitle,")
a("} from " + q("@/components/ui/card") + ";")
a("import { Tabs, TabsContent, TabsList, TabsTrigger } from " + q("@/components/ui/tabs") + ";")
a("import { Badge } from " + q("@/components/ui/badge") + ";")
a("import { Button } from " + q("@/components/ui/button") + ";")
a("import {")
a("  Select,")
a("  SelectContent,")
a("  SelectItem,")
a("  SelectTrigger,")
a("  SelectValue,")
a("} from " + q("@/components/ui/select") + ";")
a("import { Input } from " + q("@/components/ui/input") + ";")
a("import { Label } from " + q("@/components/ui/label") + ";")
a("import { Separator } from " + q("@/components/ui/separator") + ";")
