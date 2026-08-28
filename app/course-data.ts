import { CAPSTONE_BADGE } from "./capstone-data";
import { ADVANCED_BADGE } from "./advanced-data";

export type Task = {
  title: string;
  instruction: string;
};

export type ChallengeLevel = {
  id: "bronze" | "silver" | "gold";
  label: string;
  support: string;
  scenario: string;
  outcome: string;
  setup?: string[];
  deliverables?: string[];
  expectedOutput?: string;
  troubleshooting?: Array<{ problem: string; check: string }>;
  pseudocode: string;
  pythonStarter: string;
  tasks: Task[];
  tests: string[];
  hints: string[];
  model: string;
  modelNotes: string[];
};

export type Badge = {
  id: string;
  number: string;
  title: string;
  short: string;
  credential: string;
  prerequisite: string;
  optional?: boolean;
  learning: string[];
  rules: string[];
  pseudoExample: string;
  pythonExample: string;
  levels: ChallengeLevel[];
};

const code = String.raw;

const BADGE_CATALOG: Badge[] = [
  {
    id: "starter",
    number: "01",
    title: "Python Starter",
    short: "Run, read, edit and repair a small Python program.",
    credential: "Python Starter",
    prerequisite: "No Python knowledge required",
    learning: ["Run a Python file", "Use print()", "Create and update variables", "Read simple error messages"],
    rules: [
      "Python runs from top to bottom.",
      "Text must be inside matching quotation marks.",
      "Python is case-sensitive: Name and name are different.",
      "A # begins a comment. Python ignores the rest of that line.",
    ],
    pseudoExample: code`OUTPUT "Welcome"
Name ← "Maya"
OUTPUT Name`,
    pythonExample: code`print("Welcome")
name = "Maya"
print(name)`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Use the pseudocode and complete a short cloze exercise.",
        scenario: "Welcome screen", outcome: "Display two lines and store one item of text in a variable.",
        pseudocode: code`OUTPUT "Python Bridge"
StudentName ← "Sam"
OUTPUT StudentName`,
        pythonStarter: code`# Complete all three blanks from the pseudocode.
print("________________")
student_name = "________________"
print(________________)

# Add the final Badge started output yourself.`,
        tasks: [
          { title: "1. Translate", instruction: "Use the pseudocode to complete the title, stored name and variable output. Decide which blanks need quotation marks." },
          { title: "2. Personalise", instruction: "Store your own first name in student_name, then run the program." },
          { title: "3. Add", instruction: "Add a final line that displays: Badge started." },
        ],
        tests: ["The first line is Python Bridge.", "The second line is your name, without quotation marks around it.", "The final line is Badge started."],
        hints: ["The variable is called student_name.", "Use print(student_name) to display what the variable stores.", "Use print(\"Badge started\") for the final line."],
        model: code`print("Python Bridge")
student_name = "Sam"
print(student_name)
print("Badge started")`,
        modelNotes: ["Quotation marks mark literal text.", "No quotation marks are used when reading a variable."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Use the pseudocode; fewer Python lines are supplied.",
        scenario: "Student profile", outcome: "Store three values, change one value and display the result.",
        pseudocode: code`Name ← "Alex"
YearGroup ← 12
Course ← "Computer Science"
YearGroup ← YearGroup + 1
OUTPUT Name
OUTPUT YearGroup
OUTPUT Course`,
        pythonStarter: code`name = "Alex"
# Create year_group and course below

# Increase year_group by 1

# Display all three values`,
        tasks: [
          { title: "1. Create", instruction: "Translate the three assignment statements. Numbers do not need quotation marks." },
          { title: "2. Update", instruction: "Increase year_group by one using its current value." },
          { title: "3. Display", instruction: "Print each final value on a separate line." },
        ],
        tests: ["Alex is displayed.", "13 is displayed, not 12.", "Computer Science is displayed."],
        hints: ["Assignment uses = in Python.", "Use year_group = year_group + 1.", "Use one print() instruction for each output."],
        model: code`name = "Alex"
year_group = 12
course = "Computer Science"

year_group = year_group + 1

print(name)
print(year_group)
print(course)`,
        modelNotes: ["The same = symbol creates and updates a Python variable.", "Python variable names here use snake_case."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Repair the program without a Python skeleton.",
        scenario: "Broken timetable card", outcome: "Find and correct syntax and name errors.",
        pseudocode: code`Subject ← "Computer Science"
Room ← "B14"
Lesson ← 2
OUTPUT Subject
OUTPUT Room
OUTPUT Lesson`,
        pythonStarter: code`subject = Computer Science
Room = "B14"
lesson = 2

print(Subject)
print(room)
print lesson`,
        tasks: [
          { title: "1. Repair the text", instruction: "Fix the first line so Computer Science is stored as text." },
          { title: "2. Repair the names", instruction: "Make the variable names match exactly wherever they are used." },
          { title: "3. Repair the output", instruction: "Correct the final print instruction and run the whole program." },
        ],
        tests: ["No red error message appears.", "The outputs are Computer Science, B14 and 2 in that order.", "Changing room to C08 changes the second output."],
        hints: ["Text needs quotation marks.", "Python is case-sensitive.", "print is followed by parentheses."],
        model: code`subject = "Computer Science"
room = "B14"
lesson = 2

print(subject)
print(room)
print(lesson)`,
        modelNotes: ["NameError usually means Python cannot find the name you wrote.", "SyntaxError often means punctuation or structure is invalid."]
      }
    ]
  },
  {
    id: "input",
    number: "02",
    title: "Input, Types and Output",
    short: "Use string, integer and float input correctly.",
    credential: "IPO Operator",
    prerequisite: "Badge 01 recommended",
    learning: ["Use input() for text", "Use int(input()) for whole numbers", "Use float(input()) for decimals", "Build an input–process–output program"],
    rules: [
      "input() always returns text.",
      "Use int(input(...)) when the answer must be a whole number.",
      "Use float(input(...)) when the answer may contain a decimal point.",
      "Convert at the point of input so later calculations are clear.",
    ],
    pseudoExample: code`INPUT Name
INPUT Age
INPUT Price
OUTPUT Name, Age, Price`,
    pythonExample: code`name = input("Name: ")
age = int(input("Age: "))
price = float(input("Price: "))
print(name, age, price)`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Learn the three input patterns separately.",
        scenario: "Event registration", outcome: "Collect text, a whole number and a decimal number using the correct conversion.",
        pseudocode: code`OUTPUT "Event registration"
INPUT Name
INPUT Tickets
INPUT Price
OUTPUT Name
OUTPUT Tickets
OUTPUT Price`,
        pythonStarter: code`print("Event registration")

# Write one input line for name.
# Write one converted input line for tickets.
# Write one converted input line for price.

# Display the three stored values.`,
        tasks: [
          { title: "1. Text input", instruction: "Write the complete name input statement. Run it and confirm the entered name is stored as text." },
          { title: "2. Integer input", instruction: "Write the complete tickets input statement, including conversion to a whole number." },
          { title: "3. Float and output", instruction: "Write the complete price input statement, then display all three stored values." },
        ],
        tests: ["Name: Ana is accepted.", "Tickets: 3 is accepted as an integer.", "Price: 12.50 is accepted as a float and displayed as 12.5."],
        hints: ["Plain input() is correct for a name.", "Use int(input(...)) for tickets.", "Use float(input(...)) for price."],
        model: code`print("Event registration")
name = input("Name: ")
tickets = int(input("Number of tickets: "))
price = float(input("Price of one ticket: "))

print(name)
print(tickets)
print(price)`,
        modelNotes: ["int converts input text into a whole number.", "float converts input text into a number that may include a decimal point."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Translate a complete IPO algorithm.",
        scenario: "Ticket cost", outcome: "Calculate a subtotal from integer and float inputs.",
        pseudocode: code`INPUT CustomerName
INPUT NumberOfTickets
INPUT TicketPrice
Subtotal ← NumberOfTickets * TicketPrice
OUTPUT CustomerName
OUTPUT Subtotal`,
        pythonStarter: code`customer_name = input("Customer name: ")
# Collect number_of_tickets as an integer
# Collect ticket_price as a float
# Calculate subtotal
# Display the customer name and subtotal`,
        tasks: [
          { title: "1. Collect", instruction: "Write the two missing numeric input instructions using the correct conversions." },
          { title: "2. Process", instruction: "Multiply the number of tickets by the price of one ticket." },
          { title: "3. Output", instruction: "Display a clear result containing the customer name and subtotal." },
        ],
        tests: ["2 tickets at 7.5 gives 15.0.", "4 tickets at 12.25 gives 49.0.", "Changing the customer's name does not change the calculation."],
        hints: ["Ticket count is a whole number; price may be decimal.", "subtotal = number_of_tickets * ticket_price", "print(customer_name, \"must pay\", subtotal) is acceptable."],
        model: code`customer_name = input("Customer name: ")
number_of_tickets = int(input("Number of tickets: "))
ticket_price = float(input("Price of one ticket: "))

subtotal = number_of_tickets * ticket_price

print(customer_name, "must pay", subtotal)`,
        modelNotes: ["The program follows input, process, output in visible stages.", "The calculation works because both numeric inputs were converted."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Choose each type and write the program independently.",
        scenario: "Journey summary", outcome: "Convert a duration in minutes into hours and remaining minutes.",
        pseudocode: code`INPUT RouteName
INPUT TotalMinutes
Hours ← TotalMinutes DIV 60
Minutes ← TotalMinutes MOD 60
OUTPUT RouteName
OUTPUT Hours, "hours", Minutes, "minutes"`,
        pythonStarter: code`# Write the complete program from the pseudocode.
# Python DIV is //
# Python MOD is %`,
        tasks: [
          { title: "1. Choose types", instruction: "Collect route_name as text and total_minutes as an integer." },
          { title: "2. Calculate", instruction: "Use // for the whole hours and % for the remaining minutes." },
          { title: "3. Present", instruction: "Display one clear journey summary." },
        ],
        tests: ["125 minutes becomes 2 hours 5 minutes.", "60 minutes becomes 1 hour 0 minutes.", "59 minutes becomes 0 hours 59 minutes."],
        hints: ["Do not use float for a count of minutes.", "hours = total_minutes // 60", "minutes = total_minutes % 60"],
        model: code`route_name = input("Route name: ")
total_minutes = int(input("Journey time in minutes: "))

hours = total_minutes // 60
minutes = total_minutes % 60

print(route_name)
print(hours, "hours", minutes, "minutes")`,
        modelNotes: ["// gives the whole-number quotient.", "% gives the remainder."]
      }
    ]
  },
  {
    id: "selection",
    number: "03",
    title: "Decision Maker",
    short: "Translate IF structures and validate decisions.",
    credential: "Decision Maker",
    prerequisite: "Badge 02 recommended",
    learning: ["Write if, elif and else", "Use == for equality", "Combine Boolean conditions", "Order conditions correctly"],
    rules: ["A Python condition ends with a colon.", "The controlled instructions must be indented.", "Use == to compare; use = to assign.", "Test the most restrictive range first."],
    pseudoExample: code`IF Score >= 70 THEN
    OUTPUT "Distinction"
ELSE
    OUTPUT "Not yet"
ENDIF`,
    pythonExample: code`if score >= 70:
    print("Distinction")
else:
    print("Not yet")`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Complete one decision at a time.",
        scenario: "Assessment result", outcome: "Display Pass or Review from an integer score.",
        pseudocode: code`INPUT Score
IF Score >= 50 THEN
    OUTPUT "Pass"
ELSE
    OUTPUT "Review"
ENDIF`,
        pythonStarter: code`score = int(input("Score: "))

# Translate the complete IF / ELSE structure.
# Use the exact messages from the pseudocode.`,
        tasks: [
          { title: "1. Condition", instruction: "Complete the comparison so that 50 is included in Pass." },
          { title: "2. Alternative", instruction: "Complete the Python keyword for every other score." },
          { title: "3. Test", instruction: "Run the program with a score on each side of the boundary." },
        ],
        tests: ["49 displays Review.", "50 displays Pass.", "82 displays Pass."],
        hints: ["Use >= rather than >.", "The alternative keyword is else.", "Both if and else lines end with a colon."],
        model: code`score = int(input("Score: "))

if score >= 50:
    print("Pass")
else:
    print("Review")`,
        modelNotes: ["The boundary value 50 is deliberately tested.", "Indentation shows which output belongs to each branch."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Translate a three-way decision.",
        scenario: "Journey delay", outcome: "Classify a delay as On time, Delayed or Severe.",
        pseudocode: code`INPUT Delay
IF Delay = 0 THEN
    OUTPUT "On time"
ELSE
    IF Delay <= 15 THEN
        OUTPUT "Delayed"
    ELSE
        OUTPUT "Severe"
    ENDIF
ENDIF`,
        pythonStarter: code`delay = int(input("Delay in minutes: "))

# Write one if / elif / else structure below.`,
        tasks: [
          { title: "1. Exact match", instruction: "Use == to detect a delay of exactly zero." },
          { title: "2. Middle range", instruction: "Use elif for delays from 1 to 15 minutes." },
          { title: "3. Remaining values", instruction: "Use else for delays greater than 15 minutes." },
        ],
        tests: ["0 displays On time.", "1 and 15 display Delayed.", "16 and 60 display Severe."],
        hints: ["Python equality is ==.", "elif delay <= 15: handles the middle range after zero is excluded.", "The final else needs no condition."],
        model: code`delay = int(input("Delay in minutes: "))

if delay == 0:
    print("On time")
elif delay <= 15:
    print("Delayed")
else:
    print("Severe")`,
        modelNotes: ["elif is Python syntax; Cambridge pseudocode uses a nested IF in ELSE.", "Ordering removes the need to write delay >= 1 in the middle condition."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Build and justify a compound decision.",
        scenario: "Activity booking", outcome: "Check both age and available places.",
        pseudocode: code`INPUT Age
INPUT PlacesLeft
IF Age >= 14 AND PlacesLeft > 0 THEN
    OUTPUT "Booking accepted"
ELSE
    IF Age < 14 THEN
        OUTPUT "Age requirement not met"
    ELSE
        OUTPUT "Activity full"
    ENDIF
ENDIF`,
        pythonStarter: code`# Write the complete program.
# Python AND is written as: and`,
        tasks: [
          { title: "1. Collect", instruction: "Collect age and places_left as integers." },
          { title: "2. Decide", instruction: "Accept only when both requirements are true." },
          { title: "3. Explain", instruction: "Add separate messages for the two reasons a booking can be rejected." },
        ],
        tests: ["Age 14 with 1 place is accepted.", "Age 13 with 5 places reports the age problem.", "Age 16 with 0 places reports that the activity is full."],
        hints: ["Use and between two complete conditions.", "The first condition is age >= 14 and places_left > 0.", "After acceptance fails, check age < 14 before the final else."],
        model: code`age = int(input("Age: "))
places_left = int(input("Places left: "))

if age >= 14 and places_left > 0:
    print("Booking accepted")
elif age < 14:
    print("Age requirement not met")
else:
    print("Activity full")`,
        modelNotes: ["and requires both complete conditions to be true.", "The second branch explains the most specific remaining failure."]
      }
    ]
  },
  {
    id: "loops",
    number: "04",
    title: "Loop Controller",
    short: "Use FOR and WHILE loops without off-by-one errors.",
    credential: "Loop Controller",
    prerequisite: "Badge 03 recommended",
    learning: ["Translate inclusive FOR bounds", "Use range()", "Write a WHILE loop", "Use total, count and maximum patterns"],
    rules: ["range() stops before its final value.", "The body of a loop is indented.", "A WHILE loop must change something used in its condition.", "Initialise totals, counts and best-so-far values before the loop."],
    pseudoExample: code`FOR Number ← 1 TO 5
    OUTPUT Number
NEXT Number`,
    pythonExample: code`for number in range(1, 6):
    print(number)`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Make range() include the intended final value.",
        scenario: "Five-day check-in", outcome: "Print day numbers and collect one value per day.",
        pseudocode: code`Total ← 0
FOR Day ← 1 TO 5
    INPUT Minutes
    Total ← Total + Minutes
NEXT Day
OUTPUT Total`,
        pythonStarter: code`total = 0

# Translate the FOR loop from the pseudocode.
# Remember that Python's range stop value is excluded.
# Keep the final output outside the loop.`,
        tasks: [
          { title: "1. Bounds", instruction: "Complete range() so the loop runs for days 1, 2, 3, 4 and 5." },
          { title: "2. Accumulate", instruction: "Add each minutes input to total." },
          { title: "3. Verify", instruction: "Enter five values and confirm the displayed total." },
        ],
        tests: ["Inputs 10, 10, 10, 10, 10 give 50.", "Inputs 5, 0, 12, 8, 5 give 30.", "The program asks for exactly five values."],
        hints: ["To include 5, range must stop at 6.", "Use total = total + minutes.", "print(total) stays outside the loop."],
        model: code`total = 0

for day in range(1, 6):
    minutes = int(input("Minutes: "))
    total = total + minutes

print(total)`,
        modelNotes: ["The pseudocode upper bound is inclusive; the Python stop value is exclusive.", "total exists before the loop so it can accumulate across iterations."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Choose and control a pre-condition loop.",
        scenario: "Validated menu", outcome: "Keep asking until the user chooses 1, 2 or 3.",
        pseudocode: code`Choice ← 0
WHILE Choice < 1 OR Choice > 3
    INPUT Choice
ENDWHILE
OUTPUT "Accepted"`,
        pythonStarter: code`choice = 0

# Translate the WHILE loop.
# Remember that Python uses or.

print("Accepted")`,
        tasks: [
          { title: "1. Condition", instruction: "Write a condition that is true while the choice is outside 1 to 3." },
          { title: "2. Change", instruction: "Collect a new integer choice inside the loop." },
          { title: "3. Confirm", instruction: "Display Accepted only after the loop has finished." },
        ],
        tests: ["0 then 2 asks twice and accepts 2.", "4 then 3 asks twice and accepts 3.", "1 is accepted immediately after one input."],
        hints: ["Use while choice < 1 or choice > 3:", "The input line must be indented.", "The final print line is not indented."],
        model: code`choice = 0

while choice < 1 or choice > 3:
    choice = int(input("Choose 1, 2 or 3: "))

print("Accepted")`,
        modelNotes: ["The loop repeats while the data is invalid.", "Assigning a new choice inside the loop allows the condition to become false."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Combine loop patterns without a skeleton.",
        scenario: "Five temperature readings", outcome: "Calculate total, count below zero and highest reading.",
        pseudocode: code`Total ← 0
BelowZero ← 0
INPUT Temperature
Highest ← Temperature
Total ← Total + Temperature
IF Temperature < 0 THEN
    BelowZero ← BelowZero + 1
ENDIF
FOR Reading ← 2 TO 5
    INPUT Temperature
    Total ← Total + Temperature
    IF Temperature < 0 THEN
        BelowZero ← BelowZero + 1
    ENDIF
    IF Temperature > Highest THEN
        Highest ← Temperature
    ENDIF
NEXT Reading
OUTPUT Total, BelowZero, Highest`,
        pythonStarter: code`# Translate the algorithm independently.
# The first input initialises highest.
# A second loop handles readings 2 to 5.`,
        tasks: [
          { title: "1. Initialise", instruction: "Collect the first reading and use it to initialise total and highest." },
          { title: "2. Process", instruction: "Collect the remaining four readings and update all three results." },
          { title: "3. Report", instruction: "Display total, number below zero and highest with clear labels." },
        ],
        tests: ["2, 4, -1, 7, -3 gives total 9, below zero 2, highest 7.", "-5, -2, -9, -1, -4 gives highest -1.", "The program requests exactly five readings."],
        hints: ["Do not initialise highest to zero; every reading might be negative.", "The remaining loop is range(2, 6).", "Use separate IF statements because one reading may affect more than one result."],
        model: code`total = 0
below_zero = 0

temperature = float(input("Reading 1: "))
highest = temperature
total = total + temperature
if temperature < 0:
    below_zero = below_zero + 1

for reading in range(2, 6):
    temperature = float(input("Next reading: "))
    total = total + temperature
    if temperature < 0:
        below_zero = below_zero + 1
    if temperature > highest:
        highest = temperature

print("Total:", total)
print("Below zero:", below_zero)
print("Highest:", highest)`,
        modelNotes: ["Initialising highest from real data works even when all readings are negative.", "The three loop patterns remain visible and independently testable."]
      }
    ]
  },
  {
    id: "lists",
    number: "05",
    title: "List Navigator",
    short: "Translate 1D arrays into Python lists and process them.",
    credential: "List Navigator",
    prerequisite: "Badge 04 recommended",
    learning: ["Create and index lists", "Translate 1-based to 0-based positions", "Traverse a list", "Calculate total, average, maximum and count"],
    rules: ["The first Python list item is at index 0.", "len(values) is the number of items.", "Use values[index] when the position matters.", "Do not change a list while traversing it unless that change is intentional."],
    pseudoExample: code`DECLARE Scores : ARRAY[1:4] OF INTEGER
Scores[1] ← 12
OUTPUT Scores[1]`,
    pythonExample: code`scores = [0, 0, 0, 0]
scores[0] = 12
print(scores[0])`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Practise index translation before processing.",
        scenario: "Four assessment scores", outcome: "Create, read and update a list.",
        pseudocode: code`Scores ← [62, 71, 58, 80]
OUTPUT Scores[1]
Scores[3] ← 65
OUTPUT Scores[3]`,
        pythonStarter: code`scores = [62, 71, 58, 80]

# Display the first item.
# Change the third item to 65.
# Display the changed item and then the complete list.`,
        tasks: [
          { title: "1. First item", instruction: "Use the correct Python index to display the first score." },
          { title: "2. Third item", instruction: "Change the third score from 58 to 65." },
          { title: "3. Confirm", instruction: "Display the changed third score." },
        ],
        tests: ["The first output is 62.", "The second output is 65.", "The final list is [62, 71, 65, 80]."],
        hints: ["Pseudocode position 1 becomes Python index 0.", "Pseudocode position 3 becomes Python index 2.", "Use scores[2] for both the update and second output."],
        model: code`scores = [62, 71, 58, 80]
print(scores[0])
scores[2] = 65
print(scores[2])
print(scores)`,
        modelNotes: ["List positions and Python indices differ by one in this example.", "Displaying the whole list is a useful temporary check."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Translate the standard processing patterns.",
        scenario: "Class score summary", outcome: "Calculate total, average, highest and pass count.",
        pseudocode: code`Scores ← [62, 71, 58, 80, 49]
Total ← 0
Highest ← Scores[1]
PassCount ← 0
FOR Position ← 1 TO 5
    Total ← Total + Scores[Position]
    IF Scores[Position] > Highest THEN
        Highest ← Scores[Position]
    ENDIF
    IF Scores[Position] >= 50 THEN
        PassCount ← PassCount + 1
    ENDIF
NEXT Position
Average ← Total / 5`,
        pythonStarter: code`scores = [62, 71, 58, 80, 49]
total = 0
highest = scores[0]
pass_count = 0

for position in range(0, len(scores)):
    # Update the three results.

average = total / len(scores)`,
        tasks: [
          { title: "1. Total", instruction: "Add the current list value to total on every iteration." },
          { title: "2. Compare", instruction: "Update highest and pass_count using two separate decisions." },
          { title: "3. Average", instruction: "Calculate and display the four final results." },
        ],
        tests: ["Total is 320.", "Average is 64.0.", "Highest is 80 and pass count is 4."],
        hints: ["The current value is scores[position].", "Compare scores[position] with highest.", "Use len(scores), not a typed number, for the divisor."],
        model: code`scores = [62, 71, 58, 80, 49]
total = 0
highest = scores[0]
pass_count = 0

for position in range(0, len(scores)):
    total = total + scores[position]
    if scores[position] > highest:
        highest = scores[position]
    if scores[position] >= 50:
        pass_count = pass_count + 1

average = total / len(scores)
print("Total:", total)
print("Average:", average)
print("Highest:", highest)
print("Passes:", pass_count)`,
        modelNotes: ["A single traversal calculates several independent results.", "highest starts at a genuine list value."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Build a list program from requirements and tests.",
        scenario: "Weekly journey times", outcome: "Collect seven values, identify extremes and count late journeys.",
        pseudocode: code`DECLARE Times : ARRAY[1:7] OF INTEGER
FOR Day ← 1 TO 7
    INPUT Times[Day]
NEXT Day
// Calculate total, average, shortest,
// longest and count above 45 minutes.`,
        pythonStarter: code`# Create an empty list.
# Collect seven integer journey times using append().
# Process the completed list.`,
        tasks: [
          { title: "1. Collect", instruction: "Use a loop and append() to store exactly seven journey times." },
          { title: "2. Analyse", instruction: "Calculate total, average, shortest, longest and a count above 45." },
          { title: "3. Explain", instruction: "Display each result with a label and add a comment explaining your initialisation." },
        ],
        tests: ["30, 50, 45, 40, 60, 35, 55 gives total 315 and average 45.0.", "The shortest is 30 and longest is 60.", "Three journeys are above 45; 45 itself is not counted."],
        hints: ["Start with times = [] and use times.append(value).", "After collection, use times[0] for both shortest and longest.", "Use if time > 45 for the late count."],
        model: code`times = []

for day in range(1, 8):
    value = int(input("Journey time: "))
    times.append(value)

total = 0
shortest = times[0]
longest = times[0]
late_count = 0

for position in range(0, len(times)):
    total = total + times[position]
    if times[position] < shortest:
        shortest = times[position]
    if times[position] > longest:
        longest = times[position]
    if times[position] > 45:
        late_count = late_count + 1

average = total / len(times)
print("Total:", total)
print("Average:", average)
print("Shortest:", shortest)
print("Longest:", longest)
print("Above 45 minutes:", late_count)`,
        modelNotes: ["Collection and processing are separated, making each stage easier to test.", "The boundary wording ‘above 45’ requires > rather than >=."]
      }
    ]
  },
  {
    id: "grids",
    number: "06",
    title: "Grid Mapper",
    short: "Create and process 2D Python lists with nested loops.",
    credential: "Grid Mapper",
    prerequisite: "Badge 05 recommended",
    learning: ["Represent a 2D array as a list of lists", "Access row and column indices", "Use nested loops", "Calculate row and column results"],
    rules: ["A grid is a list containing row lists.", "Use grid[row][column], not grid[row, column].", "The outer loop chooses a row; the inner loop chooses a column.", "Check row and column bounds separately."],
    pseudoExample: code`DECLARE Grid : ARRAY[1:2, 1:3] OF INTEGER
OUTPUT Grid[2, 3]`,
    pythonExample: code`grid = [[2, 4, 6], [1, 3, 5]]
print(grid[1][2])`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Read and change individual grid positions.",
        scenario: "Two-row seating plan", outcome: "Access and update cells using two indices.",
        pseudocode: code`Seats ← [["A1", "A2", "A3"],
          ["B1", "B2", "B3"]]
OUTPUT Seats[1, 1]
OUTPUT Seats[2, 3]
Seats[2, 2] ← "BOOKED"`,
        pythonStarter: code`seats = [["A1", "A2", "A3"],
         ["B1", "B2", "B3"]]

# Display the top-left cell.
# Display the bottom-right cell.
# Replace B2 with "BOOKED", then display the second row.`,
        tasks: [
          { title: "1. Top-left", instruction: "Display A1 using Python's row and column indices." },
          { title: "2. Bottom-right", instruction: "Display B3." },
          { title: "3. Update", instruction: "Replace B2 with BOOKED and display the second row." },
        ],
        tests: ["The first output is A1.", "The second output is B3.", "The second row becomes ['B1', 'BOOKED', 'B3']."],
        hints: ["A1 is row 0, column 0.", "B3 is row 1, column 2.", "B2 is row 1, column 1."],
        model: code`seats = [["A1", "A2", "A3"],
         ["B1", "B2", "B3"]]

print(seats[0][0])
print(seats[1][2])
seats[1][1] = "BOOKED"
print(seats[1])`,
        modelNotes: ["The first index chooses the row list.", "The second index chooses an item inside that row."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Use nested loops to process every cell.",
        scenario: "Temperature grid", outcome: "Display every value and calculate each row total.",
        pseudocode: code`Temperatures ← [[12, 14, 13], [9, 11, 10]]
FOR Row ← 1 TO 2
    RowTotal ← 0
    FOR Column ← 1 TO 3
        OUTPUT Temperatures[Row, Column]
        RowTotal ← RowTotal + Temperatures[Row, Column]
    NEXT Column
    OUTPUT RowTotal
NEXT Row`,
        pythonStarter: code`temperatures = [[12, 14, 13], [9, 11, 10]]

for row in range(0, len(temperatures)):
    row_total = 0
    # Write the inner loop.
    # Display the row total after the inner loop.`,
        tasks: [
          { title: "1. Inner loop", instruction: "Loop through the columns in the current row." },
          { title: "2. Process cells", instruction: "Display and add temperatures[row][column]." },
          { title: "3. Place output", instruction: "Display each row total after its inner loop finishes." },
        ],
        tests: ["All six temperatures are displayed.", "The first row total is 39.", "The second row total is 30."],
        hints: ["Use len(temperatures[row]) for the number of columns.", "The cell is temperatures[row][column].", "print(row_total) aligns with the inner for, not its body."],
        model: code`temperatures = [[12, 14, 13], [9, 11, 10]]

for row in range(0, len(temperatures)):
    row_total = 0
    for column in range(0, len(temperatures[row])):
        print(temperatures[row][column])
        row_total = row_total + temperatures[row][column]
    print("Row total:", row_total)`,
        modelNotes: ["The inner loop completes once for every row.", "row_total is reset before each new row."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Solve row, column and whole-grid questions.",
        scenario: "Library study-room use", outcome: "Analyse a five-day by four-room grid.",
        pseudocode: code`Bookings stores five rows (days) and four columns (rooms).
Calculate:
1. the total for each day
2. the total for each room
3. the busiest single cell and its position`,
        pythonStarter: code`bookings = [
    [4, 6, 3, 5],
    [7, 5, 6, 4],
    [3, 8, 5, 6],
    [6, 7, 4, 5],
    [5, 9, 6, 7]
]`,
        tasks: [
          { title: "1. Row totals", instruction: "Use nested loops to display the total bookings for each day." },
          { title: "2. Column totals", instruction: "Use room as the outer loop and day as the inner loop." },
          { title: "3. Maximum cell", instruction: "Find the highest value and store both its day and room indices." },
        ],
        tests: ["Day totals are 18, 22, 22, 22 and 27.", "Room totals are 25, 35, 24 and 27.", "The maximum is 9 at Python row 4, column 1."],
        hints: ["Change which index is controlled by the outer loop for column totals.", "There are four rooms: range(0, len(bookings[0])).", "Initialise the maximum from bookings[0][0]."],
        model: code`bookings = [
    [4, 6, 3, 5],
    [7, 5, 6, 4],
    [3, 8, 5, 6],
    [6, 7, 4, 5],
    [5, 9, 6, 7]
]

for day in range(0, len(bookings)):
    day_total = 0
    for room in range(0, len(bookings[day])):
        day_total = day_total + bookings[day][room]
    print("Day", day + 1, "total:", day_total)

for room in range(0, len(bookings[0])):
    room_total = 0
    for day in range(0, len(bookings)):
        room_total = room_total + bookings[day][room]
    print("Room", room + 1, "total:", room_total)

highest = bookings[0][0]
highest_day = 0
highest_room = 0
for day in range(0, len(bookings)):
    for room in range(0, len(bookings[day])):
        if bookings[day][room] > highest:
            highest = bookings[day][room]
            highest_day = day
            highest_room = room

print("Highest:", highest)
print("Python position:", highest_day, highest_room)`,
        modelNotes: ["Row and column questions require different loop orientations.", "The displayed day and room can use +1 if human-friendly numbering is required."]
      }
    ]
  },
  {
    id: "subroutines",
    number: "07",
    title: "Subroutine Builder",
    short: "Translate procedures and functions into clear Python definitions.",
    credential: "Subroutine Builder",
    prerequisite: "Badge 04 recommended",
    learning: ["Define and call procedures", "Pass parameters", "Return a value", "Separate a program into purposeful routines"],
    rules: ["Python uses def for both procedures and functions.", "A function returns a value with return.", "A definition does nothing until it is called.", "For scalar changes, return the new value and assign it at the call site."],
    pseudoExample: code`FUNCTION Double(Value : INTEGER) RETURNS INTEGER
    RETURN Value * 2
ENDFUNCTION`,
    pythonExample: code`def double(value):
    return value * 2`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Define, indent and call one routine.",
        scenario: "Receipt heading", outcome: "Create and call a procedure with one parameter.",
        pseudocode: code`PROCEDURE DisplayHeading(Customer : STRING)
    OUTPUT "RECEIPT"
    OUTPUT Customer
ENDPROCEDURE

CALL DisplayHeading("Maya")`,
        pythonStarter: code`def display_heading(________):
    print("RECEIPT")
    print(customer)

display_heading(________)`,
        tasks: [
          { title: "1. Parameter", instruction: "Complete the procedure header with the customer parameter." },
          { title: "2. Call", instruction: "Pass the text Maya into the procedure." },
          { title: "3. Reuse", instruction: "Call the procedure again for a different customer." },
        ],
        tests: ["RECEIPT and Maya appear together.", "A second call displays the second name.", "Changing the argument requires no change inside the definition."],
        hints: ["Use def display_heading(customer):", "The call is display_heading(\"Maya\").", "A procedure call is not preceded by CALL in Python."],
        model: code`def display_heading(customer):
    print("RECEIPT")
    print(customer)

display_heading("Maya")
display_heading("Alex")`,
        modelNotes: ["The indented lines form the procedure body.", "The parameter receives a different argument on each call."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Return and use a calculated value.",
        scenario: "Ticket subtotal", outcome: "Write a function with two parameters and use its return value.",
        pseudocode: code`FUNCTION CalculateSubtotal(Quantity : INTEGER, Price : REAL) RETURNS REAL
    RETURN Quantity * Price
ENDFUNCTION

Total ← CalculateSubtotal(3, 7.5)
OUTPUT Total`,
        pythonStarter: code`def calculate_subtotal(quantity, price):
    # Return the calculated value.

total = # Call the function here.
print(total)`,
        tasks: [
          { title: "1. Return", instruction: "Return quantity multiplied by price." },
          { title: "2. Call", instruction: "Call the function with 3 and 7.5 and store its result." },
          { title: "3. Reuse", instruction: "Collect two inputs and call the same function again." },
        ],
        tests: ["calculate_subtotal(3, 7.5) returns 22.5.", "calculate_subtotal(0, 9.99) returns 0.0.", "The function does not ask for input itself."],
        hints: ["Use return quantity * price.", "The call can be used on the right of =.", "Keep input outside so the function can be tested directly."],
        model: code`def calculate_subtotal(quantity, price):
    return quantity * price

total = calculate_subtotal(3, 7.5)
print(total)

quantity = int(input("Quantity: "))
price = float(input("Price: "))
total = calculate_subtotal(quantity, price)
print(total)`,
        modelNotes: ["return sends a value back to the caller.", "Input is kept outside the function, giving it one clear job."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Decompose a complete program into purposeful routines.",
        scenario: "Assessment report", outcome: "Use separate functions for total, average and grade.",
        pseudocode: code`Write:
1. FUNCTION CalculateTotal(Scores)
2. FUNCTION CalculateAverage(Total, NumberOfScores)
3. FUNCTION GetBand(Average)
The main program collects five scores and calls each function.`,
        pythonStarter: code`# Write three function definitions first.
# Keep input and final output in the main program.`,
        tasks: [
          { title: "1. Design", instruction: "Define each function with only the parameters it needs." },
          { title: "2. Build", instruction: "Collect five integer scores into a list, then call the functions in order." },
          { title: "3. Test", instruction: "Test each function separately before testing the complete program." },
        ],
        tests: ["[60, 70, 80, 50, 40] gives total 300 and average 60.0.", "Average 70 gives Distinction; 50 gives Pass; 49.9 gives Review.", "Changing the list length still gives the correct average."],
        hints: ["calculate_total needs only scores.", "Use len(scores) when calculating average.", "Keep the grade boundaries in descending order."],
        model: code`def calculate_total(scores):
    total = 0
    for position in range(0, len(scores)):
        total = total + scores[position]
    return total

def calculate_average(total, number_of_scores):
    return total / number_of_scores

def get_band(average):
    if average >= 70:
        return "Distinction"
    elif average >= 50:
        return "Pass"
    else:
        return "Review"

scores = []
for count in range(0, 5):
    score = int(input("Score: "))
    scores.append(score)

total = calculate_total(scores)
average = calculate_average(total, len(scores))
band = get_band(average)

print("Total:", total)
print("Average:", average)
print("Band:", band)`,
        modelNotes: ["Each function has one clear purpose.", "The main program controls the overall sequence and user interaction."]
      }
    ]
  },
  {
    id: "files",
    number: "08",
    title: "File Handler",
    short: "Read, write and append text files safely.",
    credential: "File Handler",
    prerequisite: "Badges 05 and 07 recommended",
    learning: ["Read every line from a file", "Convert file text to numbers", "Write and append lines", "Combine files, lists and functions"],
    rules: ["File content is read as text.", "Use strip() to remove the newline from a line.", "Mode r reads, w replaces and a appends.", "with open(...) closes the file automatically."],
    pseudoExample: code`OPENFILE "scores.txt" FOR READ
WHILE NOT EOF("scores.txt")
    READFILE "scores.txt", Line
    OUTPUT Line
ENDWHILE
CLOSEFILE "scores.txt"`,
    pythonExample: code`with open("scores.txt", "r") as file:
    for line in file:
        print(line.strip())`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Use one file mode at a time.",
        scenario: "Class names file", outcome: "Read and display every stored name.",
        pseudocode: code`OPENFILE "names.txt" FOR READ
WHILE NOT EOF("names.txt")
    READFILE "names.txt", Name
    OUTPUT Name
ENDWHILE
CLOSEFILE "names.txt"`,
        pythonStarter: code`with open("names.txt", ______, encoding="utf-8") as file:
    # Loop through every line in file.
    # Remove the newline from the current line.
    # Display the cleaned name.`,
        tasks: [
          { title: "1. Mode", instruction: "Use the file mode for reading without changing the file." },
          { title: "2. Loop", instruction: "Complete the loop so it visits each line in file." },
          { title: "3. Clean", instruction: "Remove each stored newline using strip()." },
        ],
        tests: ["Every line in names.txt is displayed once.", "There are no blank lines between names.", "The content of names.txt is unchanged."],
        hints: ["Read mode is \"r\".", "Use for line in file:", "Use line.strip()."],
        model: code`with open("names.txt", "r", encoding="utf-8") as file:
    for line in file:
        name = line.strip()
        print(name)`,
        modelNotes: ["The loop ends naturally after the last line.", "with closes the file even if an error occurs later."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Write, append and then read numeric data.",
        scenario: "Personal-best log", outcome: "Write a new file, append another value and calculate the best value.",
        pseudocode: code`OPENFILE "times.txt" FOR WRITE
WRITEFILE "times.txt", 25.4
CLOSEFILE "times.txt"
OPENFILE "times.txt" FOR APPEND
WRITEFILE "times.txt", 24.9
CLOSEFILE "times.txt"
// Read all values and find the minimum.`,
        pythonStarter: code`with open("times.txt", "w", encoding="utf-8") as file:
    file.write("25.4\n")

# Append 24.9.
# Read every line, convert it to float and find the minimum.`,
        tasks: [
          { title: "1. Append", instruction: "Open the same file in append mode and write 24.9 with a newline." },
          { title: "2. Convert", instruction: "Read the file and append float(line.strip()) to a times list." },
          { title: "3. Analyse", instruction: "Find and display the lowest time without using min()." },
        ],
        tests: ["times.txt contains exactly two lines: 25.4 and 24.9.", "Both list items are floats.", "The displayed best time is 24.9."],
        hints: ["Append mode is \"a\".", "Use times.append(float(line.strip())).", "Initialise best from times[0]."],
        model: code`with open("times.txt", "w", encoding="utf-8") as file:
    file.write("25.4\n")

with open("times.txt", "a", encoding="utf-8") as file:
    file.write("24.9\n")

times = []
with open("times.txt", "r", encoding="utf-8") as file:
    for line in file:
        times.append(float(line.strip()))

best = times[0]
for position in range(0, len(times)):
    if times[position] < best:
        best = times[position]

print("Best time:", best)`,
        modelNotes: ["w replaces existing content; a preserves it and adds at the end.", "Numeric conversion is required before comparing decimal values."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Build a complete read–process–write pipeline.",
        scenario: "Sensor report", outcome: "Read unknown-length data and write a summary file.",
        pseudocode: code`Read every temperature from sensor.txt.
Calculate count, total, average, minimum and maximum.
Write the five labelled results to report.txt.`,
        pythonStarter: code`# sensor.txt contains one decimal temperature per line.
# Do not assume how many lines it contains.`,
        tasks: [
          { title: "1. Load", instruction: "Read all non-empty lines, convert them to floats and store them in a list." },
          { title: "2. Process", instruction: "Calculate count, total, average, minimum and maximum using your own loop." },
          { title: "3. Save", instruction: "Write one clearly labelled result per line to report.txt." },
        ],
        tests: ["12.5, 10.0, 13.5 gives count 3, total 36.0 and average 12.0.", "Minimum is 10.0 and maximum is 13.5.", "Running the program again replaces, rather than duplicates, the report."],
        hints: ["Use if line.strip() != \"\" before conversion.", "Initialise minimum and maximum after confirming the list is not empty.", "Use \"w\" for report.txt and include \\n at the end of each stored line."],
        model: code`temperatures = []

with open("sensor.txt", "r", encoding="utf-8") as file:
    for line in file:
        clean_line = line.strip()
        if clean_line != "":
            temperatures.append(float(clean_line))

if len(temperatures) > 0:
    total = 0
    minimum = temperatures[0]
    maximum = temperatures[0]
    for position in range(0, len(temperatures)):
        total = total + temperatures[position]
        if temperatures[position] < minimum:
            minimum = temperatures[position]
        if temperatures[position] > maximum:
            maximum = temperatures[position]
    average = total / len(temperatures)

    with open("report.txt", "w", encoding="utf-8") as file:
        file.write("Count: " + str(len(temperatures)) + "\n")
        file.write("Total: " + str(total) + "\n")
        file.write("Average: " + str(average) + "\n")
        file.write("Minimum: " + str(minimum) + "\n")
        file.write("Maximum: " + str(maximum) + "\n")
else:
    print("No readings found")`,
        modelNotes: ["The program handles an empty input file without indexing position 0.", "str() converts numeric results before joining them to file labels."]
      }
    ]
  },
  {
    id: "algorithms",
    number: "09",
    title: "Algorithm Implementer",
    short: "Implement and test linear search and bubble sort.",
    credential: "Algorithm Implementer",
    prerequisite: "Badges 05 and 07 recommended",
    learning: ["Write linear search with a flag", "Return a useful search result", "Write bubble sort", "Use a swap flag for early exit"],
    rules: ["A search must define what happens when the target is absent.", "Bubble sort compares adjacent items.", "A complete pass with no swaps means the list is sorted.", "Test duplicates, missing values and an already-sorted list."],
    pseudoExample: code`Found ← FALSE
Position ← 1
WHILE Position <= 5 AND Found = FALSE
    IF Values[Position] = Target THEN
        Found ← TRUE
    ELSE
        Position ← Position + 1
    ENDIF
ENDWHILE`,
    pythonExample: code`found = False
position = 0
while position < len(values) and found == False:
    if values[position] == target:
        found = True
    else:
        position = position + 1`,
    levels: [
      {
        id: "bronze", label: "Bronze · Guided", support: "Complete a traceable linear search.",
        scenario: "Find a student ID", outcome: "Return the Python index or -1 when absent.",
        pseudocode: code`FUNCTION LinearSearch(Values, Target) RETURNS INTEGER
    Position ← 1
    WHILE Position <= LENGTH(Values)
        IF Values[Position] = Target THEN
            RETURN Position
        ENDIF
        Position ← Position + 1
    ENDWHILE
    RETURN -1
ENDFUNCTION`,
        pythonStarter: code`def linear_search(values, target):
    position = 0
    # Translate the WHILE loop and IF statement.
    # Return the matching position immediately.
    # Increase position after an unsuccessful comparison.
    # Return -1 only after the loop has finished.`,
        tasks: [
          { title: "1. Compare", instruction: "Complete the equality comparison." },
          { title: "2. Found", instruction: "Return the current Python index when the target is found." },
          { title: "3. Missing", instruction: "Return -1 only after the loop has checked every item." },
        ],
        tests: ["Searching [14, 22, 31] for 14 returns 0.", "Searching for 31 returns 2.", "Searching for 99 returns -1."],
        hints: ["Python equality is ==.", "The current index is position.", "The missing return is outside the loop."],
        model: code`def linear_search(values, target):
    position = 0
    while position < len(values):
        if values[position] == target:
            return position
        position = position + 1
    return -1`,
        modelNotes: ["Returning immediately ends the function when a match is found.", "-1 cannot be a valid Python index in this search result contract."]
      },
      {
        id: "silver", label: "Silver · Translate", support: "Build bubble sort with visible adjacent comparisons.",
        scenario: "Sort five scores", outcome: "Sort a list into ascending order.",
        pseudocode: code`FOR Pass ← 1 TO 4
    FOR Position ← 1 TO 5 - Pass
        IF Scores[Position] > Scores[Position + 1] THEN
            Temp ← Scores[Position]
            Scores[Position] ← Scores[Position + 1]
            Scores[Position + 1] ← Temp
        ENDIF
    NEXT Position
NEXT Pass`,
        pythonStarter: code`def bubble_sort(scores):
    for pass_number in range(0, len(scores) - 1):
        for position in range(0, len(scores) - 1 - pass_number):
            # Compare and swap adjacent values.
    return scores`,
        tasks: [
          { title: "1. Compare", instruction: "Compare scores[position] with scores[position + 1]." },
          { title: "2. Swap", instruction: "Use a temporary variable to swap values in the wrong order." },
          { title: "3. Trace", instruction: "Print the list after each outer pass, then remove the temporary print." },
        ],
        tests: ["[5, 1, 4, 2, 8] becomes [1, 2, 4, 5, 8].", "[1, 2, 3] stays unchanged.", "[3, 3, 1] becomes [1, 3, 3]."],
        hints: ["Swap when the left item is greater than the right item.", "Store the left value before overwriting it.", "The inner upper bound shrinks after each pass."],
        model: code`def bubble_sort(scores):
    for pass_number in range(0, len(scores) - 1):
        for position in range(0, len(scores) - 1 - pass_number):
            if scores[position] > scores[position + 1]:
                temporary = scores[position]
                scores[position] = scores[position + 1]
                scores[position + 1] = temporary
    return scores`,
        modelNotes: ["Each comparison uses adjacent positions.", "The largest remaining value reaches its final position after each pass."]
      },
      {
        id: "gold", label: "Gold · Apply", support: "Optimise, combine and justify the algorithms.",
        scenario: "Leaderboard lookup", outcome: "Sort scores efficiently and then find a requested score.",
        pseudocode: code`Improve BubbleSort using a Swapped flag.
Stop when a complete pass makes no swaps.
After sorting, use LinearSearch to locate a target.
Report whether the target exists and its Python index.`,
        pythonStarter: code`# Write bubble_sort with a swapped flag.
# Reuse a separate linear_search function.
# Test both functions independently first.`,
        tasks: [
          { title: "1. Optimise", instruction: "Set swapped to False before a pass and True whenever a swap occurs." },
          { title: "2. Stop", instruction: "Use a while loop so another pass runs only when the previous pass swapped something." },
          { title: "3. Combine", instruction: "Sort the data, search for a target and display a clear found/not-found result." },
        ],
        tests: ["An already sorted list completes after one comparison pass.", "[9, 2, 7, 2] becomes [2, 2, 7, 9].", "Searching the sorted list for 7 finds index 2; searching for 5 returns -1."],
        hints: ["Initialise swapped = True before the while loop.", "Set swapped = False at the beginning of each pass.", "Keep the two algorithms as separate functions."],
        model: code`def bubble_sort(values):
    pass_number = 0
    swapped = True
    while swapped == True and pass_number < len(values) - 1:
        swapped = False
        for position in range(0, len(values) - 1 - pass_number):
            if values[position] > values[position + 1]:
                temporary = values[position]
                values[position] = values[position + 1]
                values[position + 1] = temporary
                swapped = True
        pass_number = pass_number + 1
    return values

def linear_search(values, target):
    position = 0
    while position < len(values):
        if values[position] == target:
            return position
        position = position + 1
    return -1

scores = [9, 2, 7, 2]
bubble_sort(scores)
target = int(input("Score to find: "))
position = linear_search(scores, target)
if position == -1:
    print("Not found")
else:
    print("Found at Python index", position)`,
        modelNotes: ["A complete pass with swapped still False proves the list is ordered.", "Separate functions allow each algorithm to be tested and reused."]
      }
    ]
  },
  {
    id: "capstone",
    number: "10",
    title: "Python Problem Solver",
    short: "Plan, build, test and explain an independent GCSE-level solution.",
    credential: "Pseudocode-to-Python Ready",
    prerequisite: "Attempt after Badges 01–09",
    learning: ["Select appropriate constructs", "Translate a complete design", "Test systematically", "Explain implementation choices"],
    rules: ["Plan before coding.", "Build and test one routine at a time.", "Use meaningful names and visible program sections.", "A working program still needs boundary and invalid-data tests."],
    pseudoExample: code`INPUT data → validate → store → process → report
Break the problem into named routines before coding.`,
    pythonExample: code`def collect_data():
    ...

def calculate_results(data):
    ...

def display_report(results):
    ...`,
    levels: [
      {
        id: "bronze", label: "Bronze · Supported capstone", support: "A complete plan and function names are supplied.",
        scenario: "Five-score analyser", outcome: "Collect, validate and analyse five assessment scores.",
        pseudocode: code`Create CollectScores, CalculateAverage and GetBand.
Accept only scores from 0 to 100.
Store five scores.
Display the scores, average, highest, lowest and band.`,
        pythonStarter: code`def collect_scores():
    # Return a list of five valid integer scores.

def calculate_average(scores):
    # Return the average.

def get_band(average):
    # Distinction >= 70, Pass >= 50, otherwise Review.`,
        tasks: [
          { title: "1. Collect", instruction: "Complete collect_scores using a nested validation loop and append()." },
          { title: "2. Process", instruction: "Write the average and band functions, then calculate highest and lowest with a loop." },
          { title: "3. Test and report", instruction: "Run all supplied tests and display a clearly labelled report." },
        ],
        tests: ["0 and 100 are accepted; -1 and 101 are rejected.", "50, 60, 70, 80, 90 gives average 70.0 and Distinction.", "Five equal scores give the same highest and lowest."],
        hints: ["Use while score < 0 or score > 100 inside the five-score for loop.", "Use scores[0] to initialise highest and lowest.", "Keep input out of the calculation functions."],
        model: code`def collect_scores():
    scores = []
    for count in range(0, 5):
        score = -1
        while score < 0 or score > 100:
            score = int(input("Score 0 to 100: "))
        scores.append(score)
    return scores

def calculate_average(scores):
    total = 0
    for position in range(0, len(scores)):
        total = total + scores[position]
    return total / len(scores)

def get_band(average):
    if average >= 70:
        return "Distinction"
    elif average >= 50:
        return "Pass"
    else:
        return "Review"

scores = collect_scores()
average = calculate_average(scores)
highest = scores[0]
lowest = scores[0]
for position in range(0, len(scores)):
    if scores[position] > highest:
        highest = scores[position]
    if scores[position] < lowest:
        lowest = scores[position]

print("Scores:", scores)
print("Average:", average)
print("Highest:", highest)
print("Lowest:", lowest)
print("Band:", get_band(average))`,
        modelNotes: ["Validation happens before a score is appended.", "The functions can be tested separately from keyboard input."]
      },
      {
        id: "silver", label: "Silver · Independent capstone", support: "Requirements and tests are supplied; design the routines yourself.",
        scenario: "Club booking manager", outcome: "Load capacities, accept bookings and save a summary.",
        pseudocode: code`clubs.txt contains ClubName,Capacity on each line.
Load the clubs and capacities into parallel lists.
Ask the user to choose a club and number of places.
Accept only if the club exists and capacity is sufficient.
Update the capacity and write an updated file.`,
        pythonStarter: code`# Decide the functions you need.
# Each input line has this form: Robotics,12
# split(",") separates the two fields.`,
        tasks: [
          { title: "1. Design", instruction: "Write a short pseudocode plan and name at least three purposeful functions." },
          { title: "2. Build", instruction: "Load, search, validate, update and save the data." },
          { title: "3. Test", instruction: "Test a missing club, too many places, the exact remaining capacity and a normal booking." },
        ],
        tests: ["An unknown club does not change the file.", "A request above capacity is rejected.", "A request equal to capacity is accepted and leaves zero places."],
        hints: ["Use line.strip().split(\",\") when loading.", "Reuse a linear search function that returns an index or -1.", "Write every updated pair back to a new or replaced file."],
        model: code`def load_clubs(filename):
    names = []
    capacities = []
    with open(filename, "r", encoding="utf-8") as file:
        for line in file:
            parts = line.strip().split(",")
            names.append(parts[0])
            capacities.append(int(parts[1]))
    return names, capacities

def linear_search(values, target):
    for position in range(0, len(values)):
        if values[position].lower() == target.lower():
            return position
    return -1

def save_clubs(filename, names, capacities):
    with open(filename, "w", encoding="utf-8") as file:
        for position in range(0, len(names)):
            file.write(names[position] + "," + str(capacities[position]) + "\n")

names, capacities = load_clubs("clubs.txt")
choice = input("Club name: ")
position = linear_search(names, choice)
if position == -1:
    print("Club not found")
else:
    places = int(input("Places required: "))
    if places < 1:
        print("Number of places must be positive")
    elif places > capacities[position]:
        print("Not enough places")
    else:
        capacities[position] = capacities[position] - places
        save_clubs("clubs_updated.txt", names, capacities)
        print("Booking accepted")`,
        modelNotes: ["Searching returns the position needed to update the matching capacity.", "The source file is preserved and an updated file is written for safer testing."]
      },
      {
        id: "gold", label: "Gold · Full independence", support: "Only the brief, success criteria and tests are supplied.",
        scenario: "Weekly room-usage report", outcome: "Process a 2D dataset and produce a persistent, modular report.",
        pseudocode: code`rooms.txt contains four comma-separated integers per line.
Each row is one day; each column is one room.
Produce daily totals, room totals, busiest cell and all cells above a user threshold.
Save the report to room_report.txt.`,
        pythonStarter: code`# Begin with analysis and a structure chart.
# Your solution must use functions, a 2D list and file handling.`,
        tasks: [
          { title: "1. Plan", instruction: "Write the data structure, function interfaces and test plan before coding." },
          { title: "2. Implement", instruction: "Build one tested function at a time, then connect the complete program." },
          { title: "3. Evaluate", instruction: "Run every test, record one correction and justify two implementation choices." },
        ],
        tests: ["A two-row file 1,2,3,4 / 4,3,2,1 gives both daily totals as 10 and every room total as 5.", "A threshold equal to a cell does not include it when the brief says above.", "An empty or malformed line is handled clearly rather than producing a silent wrong result."],
        hints: ["Separate loading, calculations and saving.", "Column totals need room as the outer loop.", "Decide whether malformed data should be rejected or skipped, then document that choice."],
        model: code`def load_grid(filename):
    grid = []
    with open(filename, "r", encoding="utf-8") as file:
        for line in file:
            clean_line = line.strip()
            if clean_line != "":
                parts = clean_line.split(",")
                if len(parts) != 4:
                    raise ValueError("Every row must contain four values")
                row = []
                for part in parts:
                    row.append(int(part))
                grid.append(row)
    return grid

def daily_totals(grid):
    totals = []
    for row in range(0, len(grid)):
        total = 0
        for column in range(0, len(grid[row])):
            total = total + grid[row][column]
        totals.append(total)
    return totals

def room_totals(grid):
    totals = []
    for column in range(0, len(grid[0])):
        total = 0
        for row in range(0, len(grid)):
            total = total + grid[row][column]
        totals.append(total)
    return totals

def busiest_cell(grid):
    best = grid[0][0]
    best_row = 0
    best_column = 0
    for row in range(0, len(grid)):
        for column in range(0, len(grid[row])):
            if grid[row][column] > best:
                best = grid[row][column]
                best_row = row
                best_column = column
    return best, best_row, best_column

def above_threshold(grid, threshold):
    positions = []
    for row in range(0, len(grid)):
        for column in range(0, len(grid[row])):
            if grid[row][column] > threshold:
                positions.append([row, column])
    return positions

grid = load_grid("rooms.txt")
if len(grid) == 0:
    print("No room data found")
else:
    days = daily_totals(grid)
    rooms = room_totals(grid)
    best, best_row, best_column = busiest_cell(grid)
    threshold = int(input("Report values above: "))
    positions = above_threshold(grid, threshold)

    with open("room_report.txt", "w", encoding="utf-8") as file:
        file.write("Daily totals: " + str(days) + "\n")
        file.write("Room totals: " + str(rooms) + "\n")
        file.write("Busiest value: " + str(best) + "\n")
        file.write("Busiest Python position: " + str([best_row, best_column]) + "\n")
        file.write("Above threshold: " + str(positions) + "\n")`,
        modelNotes: ["Each function receives data and returns a result, so it can be tested independently.", "Malformed rows are rejected explicitly instead of silently corrupting the report."]
      }
    ]
  }
];

export const BADGES: Badge[] = [
  ...BADGE_CATALOG.filter((badge) => badge.id !== "capstone"),
  CAPSTONE_BADGE,
  ADVANCED_BADGE,
];

export const TOTAL_TASKS = BADGES.reduce(
  (total, badge) => badge.optional ? total : total + badge.levels.reduce((levelTotal, level) => levelTotal + level.tasks.length, 0),
  0
);
