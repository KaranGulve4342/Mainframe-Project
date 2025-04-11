from report_generator import save_diagnosis_as_pdf
import re
import pandas as pd
import pyttsx3
from sklearn import preprocessing
from sklearn.tree import DecisionTreeClassifier, _tree
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.model_selection import cross_val_score
from sklearn.svm import SVC
import csv
import warnings
import subprocess
warnings.filterwarnings("ignore", category=DeprecationWarning)
# Load and prepare data
training = pd.read_csv('Data/Training.csv')
testing = pd.read_csv('Data/Testing.csv')
cols = training.columns
cols = cols[:-1]
x = training[cols]
y = training['prognosis']
y1 = y

# Create symptom keywords dictionary to map natural language to symptoms
symptom_mapping = {
    # Common language to symptom mappings
    'itch': 'itching',
    'scratch': 'itching',
    'rash': 'skin_rash',
    'skin eruption': 'nodal_skin_eruptions',
    'sneeze': 'continuous_sneezing',
    'sneezing': 'continuous_sneezing',
    'runny nose': 'runny_nose',
    'shiver': 'shivering',
    'cold': 'chills',
    'joint pain': 'joint_pain',
    'pain in joint': 'joint_pain',
    'stomach ache': 'stomach_pain',
    'stomach pain': 'stomach_pain',
    'stomachache': 'stomach_pain',
    'belly ache': 'stomach_pain',
    'abdominal ache': 'abdominal_pain',
    'abdominal pain': 'abdominal_pain',
    'acid': 'acidity',
    'heartburn': 'acidity',
    'tongue ulcer': 'ulcers_on_tongue',
    'mouth ulcer': 'ulcers_on_tongue',
    'canker sore': 'ulcers_on_tongue',
    'muscle waste': 'muscle_wasting',
    'throw up': 'vomiting',
    'throwing up': 'vomiting',
    'puke': 'vomiting',
    'puking': 'vomiting',
    'burning urination': 'burning_micturition',
    'painful urination': 'burning_micturition',
    'pain when urinating': 'burning_micturition',
    'blood in urine': 'spotting_ urination',
    'spotting urination': 'spotting_ urination',
    'tired': 'fatigue',
    'exhausted': 'fatigue',
    'no energy': 'fatigue',
    'gaining weight': 'weight_gain',
    'weight gain': 'weight_gain',
    'put on weight': 'weight_gain',
    'anxiety': 'anxiety',
    'worried': 'anxiety',
    'panic': 'anxiety',
    'cold hands': 'cold_hands_and_feets',
    'cold feet': 'cold_hands_and_feets',
    'mood swing': 'mood_swings',
    'mood swings': 'mood_swings',
    'losing weight': 'weight_loss',
    'weight loss': 'weight_loss',
    'dropped weight': 'weight_loss',
    'restless': 'restlessness',
    'cannot sit still': 'restlessness',
    'lethargy': 'lethargy',
    'lazy': 'lethargy',
    'no motivation': 'lethargy',
    'throat patch': 'patches_in_throat',
    'white spots throat': 'patches_in_throat',
    'sugar level': 'irregular_sugar_level', 
    'blood sugar': 'irregular_sugar_level',
    'cough': 'cough',
    'coughing': 'cough',
    'fever': 'high_fever',
    'high fever': 'high_fever',
    'high temperature': 'high_fever',
    'sunken eye': 'sunken_eyes',
    'sunken eyes': 'sunken_eyes',
    'short of breath': 'breathlessness',
    'cannot breathe': 'breathlessness',
    'breathing difficulty': 'breathlessness',
    'breathless': 'breathlessness',
    'difficulty breathing': 'breathlessness',
    'cannot catch breath': 'breathlessness',
    'sweat': 'sweating',
    'sweating': 'sweating',
    'perspire': 'sweating',
    'dehydrated': 'dehydration',
    'dehydration': 'dehydration',
    'thirsty': 'dehydration',
    'indigestion': 'indigestion',
    'upset stomach': 'indigestion',
    'headache': 'headache',
    'head hurts': 'headache',
    'head pain': 'headache',
    'head ache': 'headache',
    'migraine': 'headache',
    'yellow skin': 'yellowish_skin',
    'yellowish skin': 'yellowish_skin',
    'jaundice': 'yellowish_skin',
    'dark urine': 'dark_urine',
    'brown urine': 'dark_urine',
    'sick to stomach': 'nausea',
    'nausea': 'nausea',
    'queasy': 'nausea',
    'no appetite': 'loss_of_appetite',
    'loss of appetite': 'loss_of_appetite',
    'not hungry': 'loss_of_appetite',
    'pain behind eyes': 'pain_behind_the_eyes',
    'eye pain': 'pain_behind_the_eyes',
    'back pain': 'back_pain',
    'sore back': 'back_pain',
    'constipated': 'constipation',
    'constipation': 'constipation',
    'cannot poop': 'constipation',
    'diarrhea': 'diarrhoea',
    'diarrhoea': 'diarrhoea',
    'loose stool': 'diarrhoea',
    'loose motion': 'diarrhoea',
    'mild temperature': 'mild_fever',
    'low fever': 'mild_fever',
    'slight fever': 'mild_fever',
    'mild fever': 'mild_fever',
    'yellow urine': 'yellow_urine',
    'yellow eyes': 'yellowing_of_eyes',
    'jaundice eyes': 'yellowing_of_eyes',
    'yellowing of eyes': 'yellowing_of_eyes',
    'liver failure': 'acute_liver_failure',
    'acute liver failure': 'acute_liver_failure',
    'fluid retention': 'fluid_overload',
    'fluid overload': 'fluid_overload',
    'edema': 'fluid_overload',
    'swollen stomach': 'swelling_of_stomach',
    'bloated stomach': 'swelling_of_stomach',
    'swelling of stomach': 'swelling_of_stomach',
    'swollen lymph': 'swelled_lymph_nodes',
    'swelled lymph nodes': 'swelled_lymph_nodes',
    'lymph nodes': 'swelled_lymph_nodes',
    'feeling unwell': 'malaise',
    'malaise': 'malaise',
    'general discomfort': 'malaise',
    'blurry vision': 'blurred_and_distorted_vision',
    'blurred vision': 'blurred_and_distorted_vision',
    'blurred and distorted vision': 'blurred_and_distorted_vision',
    'cannot see clearly': 'blurred_and_distorted_vision',
    'phlegm': 'phlegm',
    'mucus': 'phlegm',
    'sputum': 'phlegm',
    'sore throat': 'throat_irritation',
    'throat pain': 'throat_irritation',
    'throat irritation': 'throat_irritation',
    'red eyes': 'redness_of_eyes',
    'redness of eyes': 'redness_of_eyes',
    'sinus pressure': 'sinus_pressure',
    'stuffy nose': 'congestion',
    'blocked nose': 'congestion',
    'congestion': 'congestion',
    'nasal congestion': 'congestion',
    'chest pain': 'chest_pain',
    'pain in chest': 'chest_pain',
    'weak limbs': 'weakness_in_limbs',
    'weakness in limbs': 'weakness_in_limbs',
    'fast heartbeat': 'fast_heart_rate',
    'racing heart': 'fast_heart_rate',
    'fast heart rate': 'fast_heart_rate',
    'heart palpitations': 'palpitations',
    'palpitations': 'palpitations',
    'bowel pain': 'pain_during_bowel_movements',
    'pain during bowel movements': 'pain_during_bowel_movements',
    'hurts when pooping': 'pain_during_bowel_movements',
    'anal pain': 'pain_in_anal_region',
    'pain in anal region': 'pain_in_anal_region',
    'blood in stool': 'bloody_stool',
    'bloody stool': 'bloody_stool',
    'anus irritation': 'irritation_in_anus',
    'irritation in anus': 'irritation_in_anus',
    'neck pain': 'neck_pain',
    'dizzy': 'dizziness',
    'dizziness': 'dizziness',
    'vertigo': 'dizziness',
    'spinning': 'spinning_movements',
    'spinning movements': 'spinning_movements',
    'cramps': 'cramps',
    'cramp': 'cramps',
    'muscle spasm': 'cramps',
    'bruising': 'bruising',
    'bruise': 'bruising',
    'black and blue': 'bruising',
    'overweight': 'obesity',
    'obesity': 'obesity',
    'heavy': 'obesity',
    'swollen legs': 'swollen_legs',
    'leg edema': 'swollen_legs',
}

reduced_data = training.groupby(training['prognosis']).max()

# Mapping strings to numbers
le = preprocessing.LabelEncoder()
le.fit(y)
y = le.transform(y)

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)
testx = testing[cols]
testy = testing['prognosis']  
testy = le.transform(testy)

clf1 = DecisionTreeClassifier()
clf = clf1.fit(x_train, y_train)
scores = cross_val_score(clf, x_test, y_test, cv=3)
print(scores.mean())

model = SVC()
model.fit(x_train, y_train)
print("for svm: ")
print(model.score(x_test, y_test))

importances = clf.feature_importances_
indices = np.argsort(importances)[::-1]
features = cols

def readn(nstr):
    engine = pyttsx3.init()
    engine.setProperty('voice', "english+f5")
    engine.setProperty('rate', 130)
    engine.say(nstr)
    engine.runAndWait()
    engine.stop()

severityDictionary = dict()
description_list = dict()
precautionDictionary = dict()

symptoms_dict = {}
for index, symptom in enumerate(x):
    symptoms_dict[symptom] = index

def extract_symptoms(user_input):
    """
    Extract symptoms from user's natural language input
    Returns a list of symptom names from the dataset
    """
    user_input = user_input.lower()
    found_symptoms = []
    
    # Check for direct matches with symptoms
    for symptom in cols:
        symptom_text = symptom.replace('_', ' ')
        if symptom_text in user_input:
            found_symptoms.append(symptom)
    
    # Check for keyword matches
    for keyword, symptom in symptom_mapping.items():
        if keyword in user_input and symptom not in found_symptoms:
            found_symptoms.append(symptom)
    
    return found_symptoms

def calc_condition(exp, days):
    sum = 0
    for item in exp:
        sum = sum + severityDictionary[item]
    if((sum * days) / (len(exp) + 1) > 13):
        print("You should take the consultation from doctor. ")
    else:
        print("It might not be that bad but you should take precautions.")

def getDescription():
    global description_list
    with open('MasterData/symptom_Description.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            _description = {row[0]: row[1]}
            description_list.update(_description)

def getSeverityDict():
    global severityDictionary
    with open('MasterData/symptom_severity.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        try:
            for row in csv_reader:
                _diction = {row[0]: int(row[1])}
                severityDictionary.update(_diction)
        except:
            pass

def getprecautionDict():
    global precautionDictionary
    with open('MasterData/symptom_precaution.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            _prec = {row[0]: [row[1], row[2], row[3], row[4]]}
            precautionDictionary.update(_prec)

def getInfo():
    print("-----------------------------------HealthCare ChatBot-----------------------------------")
    print("\nYour Name? \t\t\t\t", end="->")
    name = input("")
    print("Hello, ", name)

def check_pattern(dis_list, inp):
    pred_list = []
    inp = inp.replace(' ', '_')
    patt = f"{inp}"
    regexp = re.compile(patt)
    pred_list = [item for item in dis_list if regexp.search(item)]
    if(len(pred_list) > 0):
        return 1, pred_list
    else:
        return 0, []

def sec_predict(symptoms_exp):
    df = pd.read_csv('Data/Training.csv')
    X = df.iloc[:, :-1]
    y = df['prognosis']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=20)
    rf_clf = DecisionTreeClassifier()
    rf_clf.fit(X_train, y_train)

    symptoms_dict = {symptom: index for index, symptom in enumerate(X)}
    input_vector = np.zeros(len(symptoms_dict))
    for item in symptoms_exp:
        input_vector[[symptoms_dict[item]]] = 1

    return rf_clf.predict([input_vector])

def print_disease(node):
    node = node[0]
    val = node.nonzero() 
    disease = le.inverse_transform(val[0])
    return list(map(lambda x: x.strip(), list(disease)))

def tree_to_code(tree, feature_names):
    tree_ = tree.tree_
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    chk_dis = ",".join(feature_names).split(",")
    symptoms_present = []

    print("\nDescribe what health issues you are experiencing in a sentence or two: ")
    user_description = input("-> ")
    
    # Extract symptoms from the user's description
    extracted_symptoms = extract_symptoms(user_description)
    
    if not extracted_symptoms:
        print("I couldn't identify any specific symptoms from your description.")
        print("Let's try a more structured approach.")
        
        # Fall back to the original symptom input method
        while True:
            print("\nEnter the symptom you are experiencing \t\t", end="->")
            disease_input = input("")
            conf, cnf_dis = check_pattern(chk_dis, disease_input)
            if conf == 1:
                print("searches related to input: ")
                for num, it in enumerate(cnf_dis):
                    print(num, ")", it)
                if num != 0:
                    print(f"Select the one you meant (0 - {num}):  ", end="")
                    conf_inp = int(input(""))
                else:
                    conf_inp = 0

                disease_input = cnf_dis[conf_inp]
                break
            else:
                print("Enter valid symptom.")
    else:
        print("\nI identified these symptoms from your description:")
        for i, symptom in enumerate(extracted_symptoms):
            print(f"{i+1}) {symptom.replace('_', ' ')}")
        
        print("\nAre these symptoms correct? (yes/no)")
        confirm = input("-> ").lower()
        
        if confirm != "yes":
            print("Let's try to be more specific.")
            while True:
                print("\nEnter the symptom you are experiencing \t\t", end="->")
                disease_input = input("")
                conf, cnf_dis = check_pattern(chk_dis, disease_input)
                if conf == 1:
                    print("searches related to input: ")
                    for num, it in enumerate(cnf_dis):
                        print(num, ")", it)
                    if num != 0:
                        print(f"Select the one you meant (0 - {num}):  ", end="")
                        conf_inp = int(input(""))
                    else:
                        conf_inp = 0

                    disease_input = cnf_dis[conf_inp]
                    break
                else:
                    print("Enter valid symptom.")
        else:
            # If user confirms the extracted symptoms, use the first one as primary
            if extracted_symptoms:
                disease_input = extracted_symptoms[0]
            else:
                # In case the extracted symptoms list becomes empty
                while True:
                    print("\nEnter the symptom you are experiencing \t\t", end="->")
                    disease_input = input("")
                    conf, cnf_dis = check_pattern(chk_dis, disease_input)
                    if conf == 1:
                        print("searches related to input: ")
                        for num, it in enumerate(cnf_dis):
                            print(num, ")", it)
                        if num != 0:
                            print(f"Select the one you meant (0 - {num}):  ", end="")
                            conf_inp = int(input(""))
                        else:
                            conf_inp = 0

                        disease_input = cnf_dis[conf_inp]
                        break
                    else:
                        print("Enter valid symptom.")
    
    while True:
        try:
            num_days = int(input("Okay. From how many days? : "))
            break
        except:
            print("Enter valid input.")
            
    def recurse(node, depth):
        indent = "  " * depth
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[node]
            threshold = tree_.threshold[node]

            if name == disease_input:
                val = 1
            else:
                val = 0
            if val <= threshold:
                recurse(tree_.children_left[node], depth + 1)
            else:
                symptoms_present.append(name)
                recurse(tree_.children_right[node], depth + 1)
        else:
            present_disease = print_disease(tree_.value[node])
            red_cols = reduced_data.columns 
            symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero()]
            
            # Begin with extracted symptoms if available
            symptoms_exp = extracted_symptoms.copy() if extracted_symptoms else []
            
            # If no extracted symptoms or confirmation was negative, start fresh
            if not symptoms_exp or disease_input not in symptoms_exp:
                symptoms_exp = [disease_input] if disease_input not in symptoms_exp else symptoms_exp
                
                print("Are you experiencing any ")
                for syms in list(symptoms_given):
                    if syms != disease_input and syms not in symptoms_exp:
                        inp = ""
                        print(syms.replace('_', ' '), "? : ", end='')
                        while True:
                            inp = input("")
                            if(inp == "yes" or inp == "no"):
                                break
                            else:
                                print("provide proper answers i.e. (yes/no) : ", end="")
                        if(inp == "yes"):
                            symptoms_exp.append(syms)
            else:
                # User confirmed extracted symptoms, but we still need to check other potential symptoms
                print("Are you experiencing any other symptoms?")
                for syms in list(symptoms_given):
                    if syms not in symptoms_exp:
                        inp = ""
                        print(syms.replace('_', ' '), "? : ", end='')
                        while True:
                            inp = input("")
                            if(inp == "yes" or inp == "no"):
                                break
                            else:
                                print("provide proper answers i.e. (yes/no) : ", end="")
                        if(inp == "yes"):
                            symptoms_exp.append(syms)

                second_prediction = sec_predict(symptoms_exp)
                calc_condition(symptoms_exp, num_days)
            
            if present_disease[0] == second_prediction[0]:
                disease = present_disease[0]
                print("You may have ", disease)
                description = description_list[disease]
                print(description)
            else:
                disease = present_disease[0]  # Primary diagnosis
                alternative = second_prediction[0]
                print("You may have ", disease, "or ", alternative)
                description = description_list[disease]
                print(description_list[disease])
                print(description_list[second_prediction[0]])
                
            precution_list = precautionDictionary[present_disease[0]]
            print("Take following measures : ")
            for i, j in enumerate(precution_list):
                print(i+1, ")", j)

            patient_name = input("Enter patient name for the report: ")
            pdf_file = save_diagnosis_as_pdf(disease, description, precution_list, patient_name)
            print(f"Report saved as: {pdf_file}")
            subprocess.run([
    'C:\\Users\\Shree\\AppData\\Roaming\\npm\\zowe.cmd',  # or wherever zowe is installed
    'zos-files', 'ul', 'dtu', './reports', 'z/z52543/odbc'
])
            # subprocess("rm {}")
            print("added to zos uss ")
            
            
            
    recurse(0, 1)

# Initialize the system
getSeverityDict()
getDescription()
getprecautionDict()
getInfo()
tree_to_code(clf, cols)
print("----------------------------------------------------------------------------------------")



def generate_report(disease_name, disease_desc, precautions, patient_name=None):
    """Generate a PDF report for a diagnosed condition"""
    from report_generator import save_diagnosis_as_pdf
    return save_diagnosis_as_pdf(disease_name, disease_desc, precautions, patient_name)
