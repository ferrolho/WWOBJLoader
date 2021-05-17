#!/bin/bash

# This script copies local changes to the three.js repository checkout residing in a parallel directory.

DIR_ME=$(realpath $(dirname ${0}))
DIR_BASE=$(realpath ${DIR_ME}/../..)
DIR_THREE=${DIR_BASE}/../three.js

cp -fv ${DIR_BASE}/public/models/obj/male02/male02.obj ${DIR_THREE}/examples/models/obj/male02/male02.obj
cp -fv ${DIR_BASE}/public/models/obj/male02/male02.mtl ${DIR_THREE}/examples/models/obj/male02/male02.mtl
cp -fv ${DIR_BASE}/public/models/obj/male02/*.jpg ${DIR_THREE}/examples/models/obj/male02/
cp -fv ${DIR_BASE}/public/models/obj/female02/female02.obj ${DIR_THREE}/examples/models/obj/female02/female02.obj
cp -fv ${DIR_BASE}/public/models/obj/female02/female02.mtl ${DIR_THREE}/examples/models/obj/female02/female02.mtl
cp -fv ${DIR_BASE}/public/models/obj/female02/*.jpg ${DIR_THREE}/examples/models/obj/female02/
cp -fv ${DIR_BASE}/public/models/obj/ninja/*.obj ${DIR_THREE}/examples/models/obj/ninja/
cp -fv ${DIR_BASE}/public/models/obj/cerberus/Cerberus.obj ${DIR_THREE}/examples/models/obj/cerberus/Cerberus.obj
cp -fv ${DIR_BASE}/public/models/obj/walt/WaltHead.* ${DIR_THREE}/examples/models/obj/walt/
