import os
import sys
import traceback
try:

    import pymel.core as pm
    import pymel.core.datatypes as dt
    import pymel.core.nodetypes as nt

except Exception as e:
    traceback.print_exc()
    
import maya.cmds as cmds
import maya.OpenMaya as om
import maya.utils
maya.utils.executeDeferred(exec("print('<ModuleName> userSetup.py')"))