package com.examportal.questionservice.service;

import com.examportal.questionservice.entity.Question;
import com.examportal.questionservice.entity.QuestionType;
import com.examportal.questionservice.entity.DifficultyLevel;
import com.examportal.questionservice.repository.QuestionRepository;
import com.examportal.questionservice.client.ExamClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private ExamClient examClient;
    
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }
    
    public Question createQuestion(Question question) {
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        
        // Set default marks based on difficulty level if not provided
        if (question.getMarks() == null && question.getDifficultyLevel() != null) {
            question.setMarks(question.getDifficultyLevel().getDefaultMarks());
        }
        
        // Ensure options are properly formatted as comma-separated string
        if (question.getOptions() == null) {
            question.setOptions("");
        }
        
        Question savedQuestion = questionRepository.save(question);
        
        // Update exam total marks
        if (savedQuestion.getExamId() != null) {
            updateExamTotalMarks(savedQuestion.getExamId());
        }
        
        return savedQuestion;
    }
    
    public Question updateQuestion(Long id, Question questionDetails) {
        Question question = getQuestionById(id);
        question.setQuestionText(questionDetails.getQuestionText());
        question.setQuestionType(questionDetails.getQuestionType());
        question.setDifficultyLevel(questionDetails.getDifficultyLevel());
        
        // Set marks based on difficulty if not explicitly provided
        if (questionDetails.getMarks() != null) {
            question.setMarks(questionDetails.getMarks());
        } else if (questionDetails.getDifficultyLevel() != null) {
            question.setMarks(questionDetails.getDifficultyLevel().getDefaultMarks());
        }
        
        question.setExamId(questionDetails.getExamId());
        
        // Ensure options are properly formatted as comma-separated string
        if (questionDetails.getOptions() != null) {
            question.setOptions(questionDetails.getOptions());
        } else {
            question.setOptions("");
        }
        
        question.setCorrectAnswer(questionDetails.getCorrectAnswer());
        question.setExplanation(questionDetails.getExplanation());
        question.setUpdatedAt(LocalDateTime.now());
        
        Question savedQuestion = questionRepository.save(question);
        
        // Update exam total marks
        if (savedQuestion.getExamId() != null) {
            updateExamTotalMarks(savedQuestion.getExamId());
        }
        
        return savedQuestion;
    }
    
    public void deleteQuestion(Long id) {
        Question question = getQuestionById(id);
        Long examId = question.getExamId();
        
        questionRepository.deleteById(id);
        
        // Update exam total marks
        if (examId != null) {
            updateExamTotalMarks(examId);
        }
    }
    
    @Transactional
    public void deleteQuestionsByExamId(Long examId) {
        System.out.println("Deleting all questions for exam: " + examId);
        List<Question> questions = questionRepository.findByExamId(examId);
        System.out.println("Found " + questions.size() + " questions to delete");
        
        if (!questions.isEmpty()) {
            questionRepository.deleteByExamId(examId);
            System.out.println("Successfully deleted " + questions.size() + " questions for exam: " + examId);
        } else {
            System.out.println("No questions found for exam: " + examId);
        }
    }
    
    public List<Question> getQuestionsByExamId(Long examId) {
        return questionRepository.findByExamId(examId);
    }
    
    public List<Question> getQuestionsByCreatedBy(Long createdBy) {
        return questionRepository.findByCreatedBy(createdBy);
    }
    
    public List<Question> getQuestionsByType(QuestionType questionType) {
        return questionRepository.findByQuestionType(questionType);
    }
    
    public List<Question> getQuestionsByDifficulty(DifficultyLevel difficultyLevel) {
        return questionRepository.findByDifficultyLevel(difficultyLevel);
    }
    
    public List<Question> getQuestionsByExamAndType(Long examId, QuestionType questionType) {
        return questionRepository.findByExamIdAndQuestionType(examId, questionType);
    }
    
    public List<Question> getQuestionsByExamAndDifficulty(Long examId, DifficultyLevel difficultyLevel) {
        return questionRepository.findByExamIdAndDifficultyLevel(examId, difficultyLevel);
    }
    
    public List<Question> getRandomQuestionsByExamId(Long examId) {
        return questionRepository.findRandomQuestionsByExamId(examId);
    }
    
    public List<Question> getRandomQuestionsByExamIdAndDifficulty(Long examId, DifficultyLevel difficulty) {
        return questionRepository.findRandomQuestionsByExamIdAndDifficulty(examId, difficulty);
    }
    
    public Long getQuestionCountByExamId(Long examId) {
        return questionRepository.countByExamId(examId);
    }
    
    public Integer getTotalMarksByExamId(Long examId) {
        Integer totalMarks = questionRepository.getTotalMarksByExamId(examId);
        return totalMarks != null ? totalMarks : 0;
    }
    
    public List<Question> createQuestionsForExam(Long examId, List<Question> questions, Long createdBy) {
        for (Question question : questions) {
            question.setExamId(examId);
            question.setCreatedBy(createdBy);
            question.setCreatedAt(LocalDateTime.now());
            question.setUpdatedAt(LocalDateTime.now());
        }
        return questionRepository.saveAll(questions);
    }
    
    public List<Question> importQuestionsFromCSV(MultipartFile file, Long examId, Long createdBy) throws IOException {
        List<Question> questions = new ArrayList<>();
        
        System.out.println("Starting CSV import for exam: " + examId + ", created by: " + createdBy);
        
        try (InputStream inputStream = file.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim().withIgnoreSurroundingSpaces())) {
            
            System.out.println("CSV Headers found: " + csvParser.getHeaderNames());
            
            int recordCount = 0;
            for (CSVRecord csvRecord : csvParser) {
                recordCount++;
                System.out.println("Processing record " + recordCount + ": " + csvRecord.toString());
                
                try {
                    Question question = new Question();
                    
                    // Get question text
                    String questionText = getCSVValue(csvRecord, "questionText", "Question Text");
                    if (questionText == null || questionText.trim().isEmpty()) {
                        System.err.println("Skipping record " + recordCount + ": No question text found");
                        continue;
                    }
                    String questionTypeStr = getCSVValue(csvRecord, "questionType", "Question Type");
                    if (questionTypeStr == null || questionTypeStr.trim().isEmpty()) {
                        questionTypeStr = "MULTIPLE_CHOICE";
                    }
                    
                    String difficultyStr = getCSVValue(csvRecord, "difficultyLevel", "Difficulty Level");
                    if (difficultyStr == null || difficultyStr.trim().isEmpty()) {
                        difficultyStr = "EASY";
                    }
                    
                    String marksStr = getCSVValue(csvRecord, "marks", "Marks");
                    String options = getCSVValue(csvRecord, "options", "Options");
                    String correctAnswer = getCSVValue(csvRecord, "correctAnswer", "Correct Answer");
                    String explanation = getCSVValue(csvRecord, "explanation", "Explanation");
                    
                    question.setQuestionText(questionText);
                    question.setQuestionType(QuestionType.valueOf(questionTypeStr.toUpperCase()));
                    DifficultyLevel difficulty = DifficultyLevel.valueOf(difficultyStr.toUpperCase());
                    question.setDifficultyLevel(difficulty);
                    
                    // Use provided marks or default based on difficulty
                    if (marksStr != null && !marksStr.trim().isEmpty()) {
                        question.setMarks(Integer.parseInt(marksStr.trim()));
                    } else {
                        question.setMarks(difficulty.getDefaultMarks());
                    }
                    
                    question.setOptions(options != null ? options : "");
                    question.setCorrectAnswer(correctAnswer != null ? correctAnswer : "");
                    question.setExplanation(explanation != null ? explanation : "");
                    question.setExamId(examId);
                    question.setCreatedBy(createdBy);
                    question.setCreatedAt(LocalDateTime.now());
                    question.setUpdatedAt(LocalDateTime.now());
                    
                    questions.add(question);
                    System.out.println("Successfully processed record " + recordCount);
                    
                } catch (Exception e) {
                    System.err.println("Error processing record " + recordCount + ": " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next record instead of failing entire import
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading CSV file: " + e.getMessage());
            throw new IOException("Failed to parse CSV file: " + e.getMessage(), e);
        }
        
        List<Question> savedQuestions = questionRepository.saveAll(questions);
        System.out.println("Saved " + savedQuestions.size() + " questions to database");
        
        // Update exam total marks
        if (examId != null) {
            updateExamTotalMarks(examId);
        }
        
        return savedQuestions;
    }
    
    private String getCSVValue(CSVRecord record, String primaryHeader, String fallbackHeader) {
        try {
            // Try primary header first
            if (record.isMapped(primaryHeader)) {
                String value = record.get(primaryHeader);
                return value != null ? value.trim() : null;
            }
            // Try fallback header
            if (record.isMapped(fallbackHeader)) {
                String value = record.get(fallbackHeader);
                return value != null ? value.trim() : null;
            }
            // Try by index if headers don't match exactly
            Map<String, Integer> headerMap = record.getParser().getHeaderMap();
            for (String header : headerMap.keySet()) {
                if (header.toLowerCase().contains(primaryHeader.toLowerCase()) || 
                    header.toLowerCase().contains(fallbackHeader.toLowerCase().replace(" ", ""))) {
                    String value = record.get(header);
                    return value != null ? value.trim() : null;
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error getting CSV value for headers " + primaryHeader + "/" + fallbackHeader + ": " + e.getMessage());
            return null;
        }
    }
    

    
    private void updateExamTotalMarks(Long examId) {
        try {
            Integer totalMarks = getTotalMarksByExamId(examId);
            System.out.println("Updating exam " + examId + " with total marks: " + totalMarks);
            examClient.updateExamTotalMarks(examId, totalMarks);
            System.out.println("Successfully updated exam total marks");
        } catch (Exception e) {
            System.err.println("Failed to update exam total marks for exam " + examId + ": " + e.getMessage());
            e.printStackTrace();
            // Don't fail the entire operation if exam update fails
        }
    }
}
