import type { Badge } from "./course-data";

const code = String.raw;

export const ADVANCED_BADGE: Badge = {
  id: "advanced-as",
  number: "11",
  title: "Advanced AS Challenges",
  short: "Optional exam-style problems for students who have mastered the core Python bridge.",
  credential: "Advanced Python Translator",
  prerequisite: "Only begin when Badges 01–10 feel secure",
  optional: true,
  learning: [
    "Turn an AS-style module description into working Python",
    "Make functions call other functions purposefully",
    "Search files, 1D lists and 2D lists",
    "Combine familiar techniques in a less-scaffolded solution",
  ],
  rules: [
    "This badge is optional. It does not count towards core course completion.",
    "The challenge is combining familiar skills, not using clever Python shortcuts.",
    "Read the Cambridge pseudocode first and identify each module’s inputs, process and return value.",
    "Test each module alone before the main program calls it.",
  ],
  pseudoExample: code`FUNCTION Contains(Target : STRING, Values : ARRAY[1:20] OF STRING) RETURNS BOOLEAN
    DECLARE Position : INTEGER
    FOR Position ← 1 TO 20
        IF Values[Position] = Target THEN
            RETURN TRUE
        ENDIF
    NEXT Position
    RETURN FALSE
ENDFUNCTION`,
  pythonExample: code`def contains(target, values):
    for position in range(0, len(values)):
        if values[position] == target:
            return True
    return False`,
  levels: [
    {
      id: "bronze",
      label: "Bronze · Advanced 1",
      support: "Advanced, but still guided: the file structure, modules and exact tests are supplied.",
      scenario: "Supplier stock report",
      outcome: "Search a stock file and save a formatted report for one supplier.",
      setup: [
        "Create a new folder called Advanced_1_Supplier_Report.",
        "Copy stock_as.txt into that folder. Do not rename or edit it.",
        "Create a new Python file in the same folder and save it as advanced_1_supplier_report.py.",
        "Run the empty Python file once. Only continue when no error appears.",
      ],
      deliverables: [
        "advanced_1_supplier_report.py - your complete program.",
        "supplier_report.txt - created by your program after entering DRG.",
        "A program run with no red error message or traceback.",
        "All three test statements below checked against your own output.",
      ],
      expectedOutput: code`Report for supplier: DRG
1234  USB Printer Cable 3 m
1273  32GB USB Flash Drive
1350  Mouse Mat 320 x 240 mm
Items listed: 3
Total quantity: 49`,
      troubleshooting: [
        { problem: "FileNotFoundError", check: "Check that stock_as.txt is in the same folder as the Python file and that its name is exactly stock_as.txt." },
        { problem: "ValueError on quantity", check: "Read exactly four lines per record. Only the fourth line of each record should be converted with int()." },
        { problem: "The report is empty", check: "Enter DRG in capitals. Check records[position][2], because column 2 stores the supplier code." },
      ],
      pseudocode: code`PROCEDURE SupplierReport(SupplierCode : STRING)
    DECLARE ItemNumber : STRING
    DECLARE Description : STRING
    DECLARE ThisSupplier : STRING
    DECLARE Quantity : INTEGER
    DECLARE MatchCount : INTEGER
    DECLARE TotalQuantity : INTEGER

    MatchCount ← 0
    TotalQuantity ← 0
    OPENFILE "stock_as.txt" FOR READ
    OPENFILE "supplier_report.txt" FOR WRITE
    WRITEFILE "supplier_report.txt", "Report for supplier: " & SupplierCode

    WHILE NOT EOF("stock_as.txt")
        READFILE "stock_as.txt", ItemNumber
        READFILE "stock_as.txt", Description
        READFILE "stock_as.txt", ThisSupplier
        READFILE "stock_as.txt", Quantity

        IF ThisSupplier = SupplierCode THEN
            WRITEFILE "supplier_report.txt", ItemNumber & "  " & Description
            MatchCount ← MatchCount + 1
            TotalQuantity ← TotalQuantity + Quantity
        ENDIF
    ENDWHILE

    WRITEFILE "supplier_report.txt", "Items listed: " & NUM_TO_STR(MatchCount)
    WRITEFILE "supplier_report.txt", "Total quantity: " & NUM_TO_STR(TotalQuantity)
    CLOSEFILE "stock_as.txt"
    CLOSEFILE "supplier_report.txt"
ENDPROCEDURE`,
      pythonStarter: code`def load_stock(filename):
    records = []
    # Each record uses four lines:
    # item number, description, supplier code, quantity.
    # Return a 2D list of records.

def find_supplier(records, supplier_code):
    matches = []
    # Return only records whose supplier code matches.

def save_supplier_report(filename, supplier_code, matches):
    # Save a heading, each matching item, the count and total quantity.

records = load_stock("stock_as.txt")
supplier_code = input("Supplier code: ").upper()
matches = find_supplier(records, supplier_code)
save_supplier_report("supplier_report.txt", supplier_code, matches)`,
      tasks: [
        {
          title: "1. Load complete records",
          instruction: "Download stock_as.txt. Read four lines at a time and store each item as [item_number, description, supplier_code, quantity]. Convert quantity to an integer.",
        },
        {
          title: "2. Search by supplier",
          instruction: "Complete find_supplier(). Use a loop and selection to return a new 2D list containing every matching record. Do not stop after the first match.",
        },
        {
          title: "3. Save the report",
          instruction: "Write a readable supplier_report.txt containing the supplier code, each matching item, number of items and total quantity. Display a clear message if the search has no matches.",
        },
      ],
      tests: [
        "DRG produces three items and a total quantity of 49.",
        "KLT produces two items and a total quantity of 15.",
        "XYZ produces zero items and the report clearly says that no matching items were found.",
      ],
      hints: [
        "Use file.readline().strip() four times inside each pass of the loading loop.",
        "The supplier code is at records[position][2]; quantity is at records[position][3].",
        "Keep calculation inside save_supplier_report() or create a separate calculate_total_quantity() function.",
      ],
      model: code`def load_stock(filename):
    records = []
    with open(filename, "r", encoding="utf-8") as file:
        while True:
            item_number = file.readline().strip()
            if item_number == "":
                break
            description = file.readline().strip()
            supplier_code = file.readline().strip()
            quantity = int(file.readline().strip())
            records.append([item_number, description, supplier_code, quantity])
    return records

def find_supplier(records, supplier_code):
    matches = []
    for position in range(0, len(records)):
        if records[position][2] == supplier_code:
            matches.append(records[position])
    return matches

def save_supplier_report(filename, supplier_code, matches):
    total_quantity = 0
    with open(filename, "w", encoding="utf-8") as file:
        file.write("Report for supplier: " + supplier_code + "\n")
        if len(matches) == 0:
            file.write("No matching items found.\n")
        else:
            for record in matches:
                file.write(record[0] + "  " + record[1] + "\n")
                total_quantity = total_quantity + record[3]
        file.write("Items listed: " + str(len(matches)) + "\n")
        file.write("Total quantity: " + str(total_quantity) + "\n")

records = load_stock("stock_as.txt")
supplier_code = input("Supplier code: ").upper()
matches = find_supplier(records, supplier_code)
save_supplier_report("supplier_report.txt", supplier_code, matches)
print("Report saved to supplier_report.txt")`,
      modelNotes: [
        "Loading, searching and reporting are separate modules, so each can be tested alone.",
        "The search returns all matches because a supplier may provide more than one item.",
      ],
    },
    {
      id: "silver",
      label: "Silver · Advanced 2",
      support: "Advanced: you are given the module behaviour, but must connect several searches yourself.",
      scenario: "Touchscreen centre finder",
      outcome: "Use directional searches of a 2D list to locate the centre of one touched area.",
      setup: [
        "Create a new folder called Advanced_2_Touchscreen.",
        "Copy touch_grid.txt into that folder. Do not add spaces or commas to the file.",
        "Create a Python file in the same folder and save it as advanced_2_touchscreen.py.",
        "The file contains 6 rows. Every row contains exactly 11 characters, and every character is 0 or 1.",
      ],
      deliverables: [
        "advanced_2_touchscreen.py - your complete program.",
        "Console output showing Python position [2, 5].",
        "Console output showing human-friendly row 3, column 6.",
        "Evidence that an empty row returns -1 rather than causing an error.",
      ],
      expectedOutput: code`Python position: [2, 5]
Screen position: row 3 column 6`,
      troubleshooting: [
        { problem: "Every search returns -1", check: "Confirm the file characters were converted with int(character). The grid must contain integers 0 and 1, not strings \"0\" and \"1\"." },
        { problem: "IndexError", check: "Valid Python rows are 0 to 5 and columns are 0 to 10. The while condition must stop before len(screen[row])." },
        { problem: "The centre is one position out", check: "Calculate Python positions first with //. Add 1 only when displaying the human-friendly row and column." },
      ],
      pseudocode: code`FUNCTION SearchInRow(Row : INTEGER, StartColumn : INTEGER) RETURNS INTEGER
    DECLARE Column : INTEGER
    DECLARE Step : INTEGER

    Column ← StartColumn
    IF StartColumn = 1 THEN
        Step ← 1
    ELSE
        Step ← -1
    ENDIF

    WHILE Column >= 1 AND Column <= ColumnCount
        IF Screen[Row, Column] = 1 THEN
            RETURN Column
        ENDIF
        Column ← Column + Step
    ENDWHILE
    RETURN -1
ENDFUNCTION

FUNCTION GetCentreColumn(Row : INTEGER) RETURNS INTEGER
    DECLARE FirstColumn : INTEGER
    DECLARE LastColumn : INTEGER
    FirstColumn ← SearchInRow(Row, 1)
    IF FirstColumn = -1 THEN
        RETURN -1
    ENDIF
    LastColumn ← SearchInRow(Row, ColumnCount)
    RETURN (FirstColumn + LastColumn) DIV 2
ENDFUNCTION

FUNCTION GetCentreRow() RETURNS INTEGER
    DECLARE Row : INTEGER
    DECLARE FirstRow : INTEGER
    DECLARE LastRow : INTEGER
    FirstRow ← -1
    LastRow ← -1

    FOR Row ← 1 TO RowCount
        IF SearchInRow(Row, 1) <> -1 THEN
            IF FirstRow = -1 THEN
                FirstRow ← Row
            ENDIF
            LastRow ← Row
        ENDIF
    NEXT Row

    IF FirstRow = -1 THEN
        RETURN -1
    ENDIF
    RETURN (FirstRow + LastRow) DIV 2
ENDFUNCTION`,
      pythonStarter: code`def load_screen(filename):
    # Return a 2D list of integers from touch_grid.txt.

def search_in_row(screen, row, start_column):
    # Search left-to-right when start_column is 0.
    # Search right-to-left when start_column is len(screen[row]) - 1.
    # Return the first position containing 1, or -1.

def get_centre_column(screen, row):
    # Call search_in_row() twice. Return the midpoint, or -1.

def get_centre_row(screen):
    # Find the first and last rows containing a 1, then return their midpoint.

screen = load_screen("touch_grid.txt")
# Find the centre row, then use it to find the centre column.`,
      tasks: [
        {
          title: "1. Load the screen",
          instruction: "Download touch_grid.txt. Convert each character on a line into an integer and build a rectangular 2D list. Confirm that it has 6 rows and 11 columns.",
        },
        {
          title: "2. Build the reusable searches",
          instruction: "Complete search_in_row() so the starting column controls the direction. Complete get_centre_column() by calling search_in_row() from both ends.",
        },
        {
          title: "3. Find and report the centre",
          instruction: "Find the first and last non-empty rows, calculate their midpoint, then find the centre column on that row. Display both Python positions and human-friendly row/column numbers.",
        },
      ],
      tests: [
        "On screen[2], searching from the left returns column position 2 and searching from the right returns column position 8.",
        "An empty row returns -1 from either direction.",
        "The final human-friendly centre is row 3, column 6; the Python position is [2, 5].",
      ],
      hints: [
        "Use step = 1 for a left-to-right search and step = -1 for right-to-left.",
        "A row contains a touch when search_in_row(screen, row, 0) does not return -1.",
        "Use integer division // when calculating a midpoint position.",
      ],
      model: code`def load_screen(filename):
    screen = []
    with open(filename, "r", encoding="utf-8") as file:
        for line in file:
            row = []
            clean_line = line.strip()
            for character in clean_line:
                row.append(int(character))
            screen.append(row)
    return screen

def search_in_row(screen, row, start_column):
    column = start_column
    if start_column == 0:
        step = 1
    else:
        step = -1

    while column >= 0 and column < len(screen[row]):
        if screen[row][column] == 1:
            return column
        column = column + step
    return -1

def get_centre_column(screen, row):
    first_column = search_in_row(screen, row, 0)
    if first_column == -1:
        return -1
    last_column = search_in_row(screen, row, len(screen[row]) - 1)
    return (first_column + last_column) // 2

def get_centre_row(screen):
    first_row = -1
    last_row = -1
    for row in range(0, len(screen)):
        if search_in_row(screen, row, 0) != -1:
            if first_row == -1:
                first_row = row
            last_row = row
    if first_row == -1:
        return -1
    return (first_row + last_row) // 2

screen = load_screen("touch_grid.txt")
centre_row = get_centre_row(screen)
if centre_row == -1:
    print("No touched area found")
else:
    centre_column = get_centre_column(screen, centre_row)
    print("Python position:", [centre_row, centre_column])
    print("Screen position: row", centre_row + 1, "column", centre_column + 1)`,
      modelNotes: [
        "One search function works in both directions because step controls how the column changes.",
        "The higher-level centre function calls the lower-level search module instead of duplicating its logic.",
      ],
    },
    {
      id: "gold",
      label: "Gold · Advanced 3",
      support: "Highest AS challenge: the brief is precise, but you decide how the modules work together.",
      scenario: "Student project module analyser",
      outcome: "Read a pseudocode project, identify its modules, search them and save a module report.",
      setup: [
        "Create a new folder called Advanced_3_Module_Analyser.",
        "Copy student_project.txt into that folder. Do not change its lines: the supplied test uses their exact line numbers.",
        "Create a Python file in the same folder and save it as advanced_3_module_analyser.py.",
        "Use the search word search for the final saved report so your result can be compared exactly with the example.",
      ],
      deliverables: [
        "advanced_3_module_analyser.py - your complete program.",
        "module_report.txt - created after searching for search.",
        "Exactly three discovered declarations: two procedures and one function.",
        "A no-match test using sort, with a clear message rather than an error.",
      ],
      expectedOutput: code`MODULE AUDIT
Line 4 | P | PROCEDURE LoadData()
Line 8 | F | FUNCTION LinearSearch(Target : STRING) RETURNS INTEGER
Line 12 | P | PROCEDURE DisplayResult(Position : INTEGER)
Procedures: 2
Functions: 1
Search: search
Match: line 8 | FUNCTION LinearSearch(Target : STRING) RETURNS INTEGER`,
      troubleshooting: [
        { problem: "No modules are found", check: "Use line.strip() before startswith(). Check for the exact beginnings \"PROCEDURE \" and \"FUNCTION \" including the final space." },
        { problem: "The line numbers are 3, 7 and 11", check: "Use enumerate(file, start=1). Blank lines still count as lines and must not be removed before reading the file." },
        { problem: "A partial search does not match", check: "Compare target.lower() with record[2].lower() using the in operator. Do not use == for a partial search." },
      ],
      pseudocode: code`FUNCTION Header(ThisLine : STRING) RETURNS CHAR
    IF LEFT(ThisLine, 10) = "PROCEDURE " THEN
        RETURN 'P'
    ELSE
        IF LEFT(ThisLine, 9) = "FUNCTION " THEN
            RETURN 'F'
        ENDIF
    ENDIF
    RETURN ' '
ENDFUNCTION

PROCEDURE FindModules(ProjectFile : STRING)
    DECLARE ThisLine : STRING
    DECLARE ThisType : CHAR
    DECLARE LineNumber : INTEGER
    ModuleCount ← 0
    LineNumber ← 0
    OPENFILE ProjectFile FOR READ

    WHILE NOT EOF(ProjectFile)
        READFILE ProjectFile, ThisLine
        LineNumber ← LineNumber + 1
        ThisType ← Header(ThisLine)
        IF ThisType <> ' ' THEN
            ModuleCount ← ModuleCount + 1
            ModInfo[ModuleCount, 1] ← NUM_TO_STR(LineNumber)
            ModInfo[ModuleCount, 2] ← ThisType
            ModInfo[ModuleCount, 3] ← ThisLine
        ENDIF
    ENDWHILE
    CLOSEFILE ProjectFile
ENDPROCEDURE`,
      pythonStarter: code`def header_type(line):
    # Return "P" for a procedure header, "F" for a function header,
    # or "" when the line is not a module declaration.

def find_modules(project_filename):
    # Call header_type() for every line.
    # Return a 2D list: [line_number, type, complete_header].

def search_modules(module_info, target):
    # Return every module whose header contains target.

def save_module_report(filename, module_info, target, matches):
    # Save every module, totals by type, the search word and its matches.

module_info = find_modules("student_project.txt")
target = input("Module name or word to search for: ")
matches = search_modules(module_info, target)
# Display matches and save the complete report.
save_module_report("module_report.txt", module_info, target, matches)`,
      tasks: [
        {
          title: "1. Identify and record modules",
          instruction: "Download student_project.txt. Call header_type() for every line. Store the line number, P or F, and full header for each declaration. Ignore ENDPROCEDURE, ENDFUNCTION and CALL lines.",
        },
        {
          title: "2. Search the module records",
          instruction: "Write search_modules(). The user may enter a full module name or part of one. Return and display every case-insensitive match, including its line number and type.",
        },
        {
          title: "3. Produce the audit report",
          instruction: "Save module_report.txt containing all discovered modules, the total number of procedures, the total number of functions and the user’s search results. Include a clear no-match message when needed.",
        },
      ],
      tests: [
        "The supplied project produces three module records on lines 4, 8 and 12.",
        "Searching for search finds LinearSearch; searching for result finds DisplayResult; searching for sort finds no match.",
        "The saved report states that the project contains two procedures and one function.",
      ],
      hints: [
        "Strip leading spaces before checking startswith(), but store the stripped header so the report is tidy.",
        "enumerate(file, start=1) supplies the human-friendly line number.",
        "Count types by checking record[1] while writing the report.",
      ],
      model: code`def header_type(line):
    clean_line = line.strip()
    if clean_line.startswith("PROCEDURE "):
        return "P"
    elif clean_line.startswith("FUNCTION "):
        return "F"
    else:
        return ""

def find_modules(project_filename):
    module_info = []
    with open(project_filename, "r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            module_type = header_type(line)
            if module_type != "":
                module_info.append([line_number, module_type, line.strip()])
    return module_info

def search_modules(module_info, target):
    matches = []
    for record in module_info:
        if target.lower() in record[2].lower():
            matches.append(record)
    return matches

def save_module_report(filename, module_info, target, matches):
    procedure_count = 0
    function_count = 0
    with open(filename, "w", encoding="utf-8") as file:
        file.write("MODULE AUDIT\n")
        for record in module_info:
            file.write("Line " + str(record[0]) + " | " + record[1] + " | " + record[2] + "\n")
            if record[1] == "P":
                procedure_count = procedure_count + 1
            else:
                function_count = function_count + 1

        file.write("Procedures: " + str(procedure_count) + "\n")
        file.write("Functions: " + str(function_count) + "\n")
        file.write("Search: " + target + "\n")
        if len(matches) == 0:
            file.write("No matching modules found.\n")
        else:
            for record in matches:
                file.write("Match: line " + str(record[0]) + " | " + record[2] + "\n")

module_info = find_modules("student_project.txt")
target = input("Module name or word to search for: ")
matches = search_modules(module_info, target)
if len(matches) == 0:
    print("No matching modules found")
else:
    for record in matches:
        print("Line", record[0], record[1], record[2])
save_module_report("module_report.txt", module_info, target, matches)
print("Complete audit saved to module_report.txt")`,
      modelNotes: [
        "find_modules() calls header_type() once for every source line, matching the AS module-decomposition style.",
        "The 2D list keeps each module’s line number, type and header together for searching and reporting.",
      ],
    },
  ],
};
