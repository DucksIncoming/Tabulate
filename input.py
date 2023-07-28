from ctypes import windll, Structure, c_long, byref
import win32api, win32con
import time
import pyautogui as pt

class POINT(Structure):
    _fields_ = [("x", c_long), ("y", c_long)]

def queryMousePosition():
    pt = POINT()
    windll.user32.GetCursorPos(byref(pt))
    return [pt.x, pt.y]

pos = queryMousePosition()

width = win32api.GetSystemMetrics(0)
height = win32api.GetSystemMetrics(1)
midWidth = int((width + 1) / 2)
midHeight = int((height + 1) / 2)
state_left = win32api.GetKeyState(0x01)

lenToPrompt = {
    0: "\nClick on the box labeled 'Subject'.",
    1: "\nClick on the box labeled 'Number'.",
    2: "\nClick on the box labeled 'Add'."
}

lenToResponse = {
    1: "Set 'subject' position to: ",
    2: "Set 'number' position to: ",
    3: "Set 'add' position to: "
}

inputPos = []
stateMemory = False
listenForClicks = True

print("Note: Do not move or scroll the browser window after setting the box positions.")
print(lenToPrompt.get(0))
while listenForClicks:
    newState = win32api.GetKeyState(0x01)
    if newState != stateMemory:
        stateMemory = newState
        if newState < 0:
            inputPos.append(queryMousePosition())
            print(lenToResponse.get(len(inputPos)))
            if (len(inputPos) < 3):
                print(lenToPrompt.get(len(inputPos)))
            else:
                listenForClicks = False
    time.sleep(0.001)

start = time.time()
with open("class-export.txt", "r") as f:
    data = f.readlines()
    for line in data:
        line = line.replace("\n", "")
        line = line.split(" ")

        pt.moveTo(inputPos[0][0], inputPos[0][1])
        pt.click()
        time.sleep(0.05)
        pt.write(line[0])
        time.sleep(0.05)

        pt.moveTo(inputPos[1][0], inputPos[1][1])
        pt.click()
        time.sleep(0.05)
        pt.write(line[1])
        time.sleep(0.05) 

        pt.moveTo(inputPos[2][0], inputPos[2][1])
        pt.click()
        time.sleep(0.1)

print("Finished in " + str(time.time() - start) + "s.")