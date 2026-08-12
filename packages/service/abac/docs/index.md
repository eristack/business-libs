---
title: Overview
description: Attribute policies that return true or false
sidebar_position: 1
---

# ABAC

`@eristack/abac` answers:

> Given these **attributes**, does policy X allow the action?

RBAC is a fixed boolean membership. ABAC runs a **policy function** with
arguments (subject attrs, resource attrs, environment) and returns allow/deny.
