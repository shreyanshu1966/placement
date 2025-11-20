# Proctored Exam System - Testing Guide

## 🧪 Quick Testing Steps

### Step 1: Test Faculty Assignment Creation with Proctoring

1. **Access the System**:
   - Open browser to: http://localhost:5174
   - Login as Faculty (use quick login if available)

2. **Create Proctored Assignment**:
   - Navigate to "Manage Assignments"
   - Click "Create New Assessment"
   - Fill in assignment details:
     - Select a course
     - Choose topics (e.g., "Arrays", "Algorithms")
     - Select students to assign
   - **Enable Proctoring**:
     - Check "Enable Proctoring"
     - Configure monitoring options:
       - ✅ Webcam Required
       - ✅ Screen Recording
       - ✅ Face Detection
       - ✅ Browser Lockdown
       - ✅ Prevent Copy/Paste
       - Set max suspicious activities (e.g., 5)
   - Click "Create Assessment"

### Step 2: Test Student Proctored Exam Interface

1. **Student Login**:
   - Login as Student
   - Go to Student Dashboard
   - Look for assignments with "Proctored" badge

2. **Start Proctored Test**:
   - Click "Start Proctored Test" on a proctored assignment
   - **System Requirements Check**:
     - Allow webcam access when prompted
     - Allow microphone access when prompted
     - Allow screen recording when prompted
   - **Pre-exam Setup**:
     - Position face in webcam frame
     - Complete environment scan
     - Accept proctoring terms

3. **During Test Experience**:
   - Notice browser lockdown (right-click disabled, copy/paste blocked)
   - Try switching tabs (should be prevented)
   - Face detection indicator should be active
   - Recording indicators should show webcam/screen recording

### Step 3: Test Faculty Monitoring Dashboard

1. **Monitor Live Sessions**:
   - As faculty, go to "Manage Assignments"
   - Find proctored assignment with active sessions
   - Click "Proctoring Monitor"

2. **Dashboard Features**:
   - View live student sessions
   - Monitor suspicious activities in real-time
   - Check security scores
   - Review webcam feeds and screen activity

3. **Session Reviews**:
   - Click on completed sessions
   - Review session details and recordings
   - Analyze suspicious activity reports
   - Use proctor review forms

### Step 4: Test Security Features

1. **Student Security Testing**:
   - During proctored exam, try:
     - Switching tabs (should trigger warning)
     - Right-clicking (should be blocked)
     - Copying text (should be prevented)
     - Opening developer tools (should be blocked)
     - Covering webcam (should detect no face)

2. **Faculty Monitoring**:
   - Watch security violations appear in real-time
   - Check automated scoring updates
   - Verify alert notifications

## 🔍 What to Look For

### ✅ Working Features Checklist

#### Assignment Creation:
- [ ] Proctoring configuration options appear
- [ ] All monitoring settings are configurable
- [ ] Assignment saves with proctoring enabled
- [ ] "Proctored" badge appears on assignments

#### Student Experience:
- [ ] System requirements check works
- [ ] Webcam setup and face detection works
- [ ] Browser lockdown prevents cheating attempts
- [ ] Recording indicators are visible
- [ ] Test interface is responsive

#### Faculty Monitoring:
- [ ] Live session monitoring displays correctly
- [ ] Suspicious activities are tracked and displayed
- [ ] Session details and recordings are accessible
- [ ] Security scores calculate properly

#### Security & Anti-Cheating:
- [ ] Tab switching is prevented/detected
- [ ] Copy/paste is blocked
- [ ] Right-click context menu is disabled
- [ ] Developer tools are blocked
- [ ] Face detection works reliably
- [ ] Screen recording captures activity

## 🚨 Troubleshooting Common Issues

### Camera/Microphone Access
- **Issue**: Browser doesn't prompt for permissions
- **Solution**: Check browser settings, ensure HTTPS or localhost
- **Check**: Look for camera/microphone icons in browser address bar

### Face Detection Not Working
- **Issue**: Face detection fails or is unreliable
- **Solution**: System uses fallback methods, check console for errors
- **Note**: Works best with good lighting and clear face visibility

### Recording Upload Issues
- **Issue**: Recordings not uploading properly
- **Solution**: Check network connection and backend server status
- **Check**: Browser developer console for upload errors

### Browser Lockdown Issues
- **Issue**: Some events not properly blocked
- **Solution**: Refresh page and restart proctored session
- **Note**: Different browsers may have varying support levels

## 📊 Expected Results

After testing, you should see:

1. **Complete Assignment Creation Flow** with proctoring options
2. **Functional Proctored Test Interface** with all security measures
3. **Working Faculty Dashboard** with real-time monitoring
4. **Active Security Features** preventing cheating attempts
5. **Recording and Monitoring Data** properly stored and displayed

## 🎯 Success Criteria

✅ **System is working properly if**:
- Faculty can create proctored assignments with custom settings
- Students can take proctored exams with all security features active
- Faculty can monitor live sessions and review completed ones
- All anti-cheating measures are functional
- Recording and data collection works reliably

## 🆘 Getting Help

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify backend server is running (should show "Server running on port 5000")
3. Ensure webcam/microphone permissions are granted
4. Try different browsers (Chrome recommended for best compatibility)
5. Check network connectivity for recording uploads

The proctored exam system is fully implemented and ready for comprehensive testing!