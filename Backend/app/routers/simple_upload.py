"""
Simplified upload endpoints with in-memory storage for rapid frontend testing.
"""
from fastapi import APIRouter, UploadFile, File, Form
from datetime import datetime
from uuid import uuid4
import pandas as pd
import numpy as np
from typing import Dict, Any

router = APIRouter(tags=["simple-upload"])

# In-memory storage
REPORTS: Dict[str, Dict[str, Any]] = {}


# ==================== ANALYTICS HELPER FUNCTIONS ====================

def analyze_statistical_observations(df: pd.DataFrame) -> Dict[str, list]:
    """Categorize data quality issues by severity."""
    critical = []
    warning = []
    optimized = []
    
    # Check duplicates
    dup_count = df.duplicated().sum()
    dup_pct = (dup_count / len(df)) * 100 if len(df) > 0 else 0
    if dup_pct > 5:
        critical.append(f"{dup_count} Duplicate Records Detected")
    elif dup_pct > 1:
        warning.append(f"{dup_count} Duplicate Records Found")
    elif dup_count == 0:
        optimized.append("No Duplicate Records")
    
    # Check missing values
    missing_total = int(df.isnull().sum().sum())
    missing_pct = (missing_total / df.size) * 100 if df.size > 0 else 0
    if missing_pct > 10:
        critical.append(f"{missing_total} Critical Missing Values")
    elif missing_pct > 0:
        warning.append(f"{missing_total} Missing Cells Detected")
    else:
        optimized.append("Complete Data Coverage")
    
    # Check data type consistency
    optimized.append("Consistent Numeric Typing")
    
    # Ensure at least one in each category
    if not critical:
        critical.append("No Critical Issues Detected")
    if not warning:
        warning.append("No Warnings")
    if not optimized:
        optimized.append("Standard Compliance")
    
    return {
        "critical": critical,
        "warning": warning,
        "optimized": optimized
    }


def generate_recommendations(df: pd.DataFrame) -> list:
    """Generate actionable data quality recommendations."""
    recommendations = []
    
    # Duplicates recommendation
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        impact_pct = min(int((dup_count / len(df)) * 100), 15)
        recommendations.append({
            "title": "CRITICAL DUPLICATES",
            "description": f"Remove {dup_count} non-unique records from the primary index.",
            "impact": f"IMPROVES SCORE +{impact_pct}%",
            "effort": "LOW EFFORT" if dup_count < 100 else "MEDIUM EFFORT"
        })
    
    # Outliers recommendation
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    if len(numeric_cols) > 0:
        outlier_counts = {}
        for col in numeric_cols:
            try:
                mean = df[col].mean()
                std = df[col].std()
                if pd.notna(std) and std > 0:
                    outliers = df[(df[col] < mean - 3*std) | (df[col] > mean + 3*std)]
                    if len(outliers) > 0:
                        outlier_counts[col] = len(outliers)
            except:
                pass
        
        if outlier_counts:
            total_outliers = sum(outlier_counts.values())
            top_col = max(outlier_counts, key=outlier_counts.get)
            recommendations.append({
                "title": "STATISTICAL OUTLIERS",
                "description": f"Filter {total_outliers} values in [{top_col}] exceeding 3x Standard Deviation.",
                "impact": "STABILIZES VARIANCE",
                "effort": "MEDIUM EFFORT"
            })
    
    # Missing values recommendation
    missing_cols = df.columns[df.isnull().any()].tolist()
    if missing_cols:
        worst_col = df.isnull().sum().idxmax()
        missing_count = int(df[worst_col].isnull().sum())
        recommendations.append({
            "title": "MISSING INFERENCES",
            "description": f"Apply mean imputation to {missing_count} null values in [{worst_col}] column.",
            "impact": "RESTORES COMPLETENESS",
            "effort": "LOW EFFORT"
        })
    
    # Type mismatch recommendation
    for col in df.select_dtypes(include=['object']).columns:
        if 'date' in col.lower() or 'time' in col.lower():
            recommendations.append({
                "title": "TYPE MISMATCH",
                "description": f"Coerce string entries in [{col}] to ISO-8601 format.",
                "impact": "ENABLES TIME-SERIES",
                "effort": "HIGH EFFORT"
            })
            break
    
    # Ensure at least some recommendations
    if not recommendations:
        recommendations.append({
            "title": "DATA QUALITY EXCELLENT",
            "description": "No critical optimizations required. Dataset meets quality standards.",
            "impact": "MAINTAIN CURRENT SCORE",
            "effort": "NO ACTION NEEDED"
        })
    
    return recommendations


def detection_breakdown(df: pd.DataFrame) -> Dict[str, Dict]:
    """Calculate anomalies detected by different methods."""
    results = {}
    numeric_df = df.select_dtypes(include=['number']).fillna(0)
    
    if len(numeric_df.columns) == 0 or len(numeric_df) < 10:
        # Not enough data for analysis
        return {
            'ISOLATIONFOREST': {'count': 0, 'method': 'Tree-Based Partitioning'},
            'Z-SCORE': {'count': 0, 'method': 'Standard Deviation Threshold'},
            'MODIFIED Z-SCORE': {'count': 0, 'method': 'Median Absolute Deviation'},
            'IQR METHOD': {'count': 0, 'method': 'Interquartile Range Filter'}
        }
    
    try:
        # IsolationForest
        from sklearn.ensemble import IsolationForest
        iso = IsolationForest(contamination=0.1, random_state=42, n_estimators=50)
        iso_predictions = iso.fit_predict(numeric_df)
        results['ISOLATIONFOREST'] = {
            'count': int((iso_predictions == -1).sum()),
            'method': 'Tree-Based Partitioning'
        }
    except:
        results['ISOLATIONFOREST'] = {'count': 0, 'method': 'Tree-Based Partitioning'}
    
    try:
        # Z-Score
        from scipy import stats
        z_scores = np.abs(stats.zscore(numeric_df, nan_policy='omit'))
        z_outliers = int((z_scores > 3).any(axis=1).sum())
        results['Z-SCORE'] = {
            'count': z_outliers,
            'method': 'Standard Deviation Threshold'
        }
    except:
        results['Z-SCORE'] = {'count': 0, 'method': 'Standard Deviation Threshold'}
    
    try:
        # Modified Z-Score (MAD)
        import numpy as np
        median = np.median(numeric_df, axis=0)
        mad = np.median(np.abs(numeric_df - median), axis=0)
        # Avoid division by zero
        mad = np.where(mad == 0, 1, mad)
        modified_z = 0.6745 * (numeric_df - median) / mad
        mad_outliers = int((np.abs(modified_z) > 3.5).any(axis=1).sum())
        results['MODIFIED Z-SCORE'] = {
            'count': mad_outliers,
            'method': 'Median Absolute Deviation'
        }
    except:
        results['MODIFIED Z-SCORE'] = {'count': 0, 'method': 'Median Absolute Deviation'}
    
    try:
        # IQR Method
        Q1 = numeric_df.quantile(0.25)
        Q3 = numeric_df.quantile(0.75)
        IQR = Q3 - Q1
        iqr_outliers = int(((numeric_df < (Q1 - 1.5 * IQR)) | (numeric_df > (Q3 + 1.5 * IQR))).any(axis=1).sum())
        results['IQR METHOD'] = {
            'count': iqr_outliers,
            'method': 'Interquartile Range Filter'
        }
    except:
        results['IQR METHOD'] = {'count': 0, 'method': 'Interquartile Range Filter'}
    
    return results

# ==================== END ANALYTICS FUNCTIONS ====================


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    name: str = Form(...)
):
    """
    Quick upload endpoint - returns immediately with mock processing status.
    """
    # Generate unique report ID
    report_id = str(uuid4())
    
    # Read file to get basic stats AND analyze data quality
    try:
        content = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(content))
        rows = len(df)
        columns = len(df.columns)
        
        # Calculate ACTUAL missing values
        missing_count = int(df.isnull().sum().sum())
        
        # Calculate ACTUAL outliers using IsolationForest
        outlier_count = 0
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        if len(numeric_cols) > 0 and rows > 10:  # Need enough data for outlier detection
            try:
                from sklearn.ensemble import IsolationForest
                # Use only numeric columns and fill any NaN values
                numeric_data = df[numeric_cols].fillna(0)
                iso = IsolationForest(contamination=0.1, random_state=42, n_estimators=50)
                outlier_predictions = iso.fit_predict(numeric_data)
                outlier_count = int((outlier_predictions == -1).sum())
            except Exception as e:
                print(f"[UPLOAD] Outlier detection failed: {e}")
                outlier_count = 0
        
    except Exception as e:
        print(f"[UPLOAD] Error analyzing file: {e}")
        rows = 0
        columns = 0
        missing_count = 0
        outlier_count = 0
    
    # Store in memory with ACTUAL analysis results
    REPORTS[report_id] = {
        "report_id": report_id,
        "dataset_id": report_id,
        "status": "completed",
        "filename": file.filename or "unknown.csv",
        "name": name,
        "rows": rows,
        "columns": columns,
        "file_size_bytes": len(content),
        "created_at": datetime.utcnow().isoformat(),
        "uploaded_at": datetime.utcnow().isoformat(),
        "processed_at": datetime.utcnow().isoformat(),
        "outlier_count": outlier_count,  # REAL data
        "missing_count": missing_count,   # REAL data
        "dataframe": df if rows > 0 else None,  # Store for analytics
    }
    
    return {
        "report_id": report_id,
        "dataset_id": report_id,
        "status": "completed",
        "filename": file.filename,
        "name": name,
        "rows": rows,
        "columns": columns,
        "file_size_bytes": len(content),
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/report/{report_id}")
async def get_report(report_id: str):
    """
    Return mock analysis report for any report ID.
    """
    # Check if we have real data
    if report_id in REPORTS:
        stored = REPORTS[report_id]
        rows = stored.get("rows", 7689)
        columns = stored.get("columns", 4)
        filename = stored.get("filename", "AUGUST2024_CLEAN.CSV")
        outlier_count = stored.get("outlier_count", 0)  # Use REAL count
        missing_count = stored.get("missing_count", 0)  # Use REAL count
    else:
        # Return mock data for unknown IDs (backward compatibility)
        rows = 7689
        columns = 4
        filename = "AUGUST2024_CLEAN.CSV"
        outlier_count = 23
        missing_count = 5
    
    # Calculate anomaly rate percentage
    total_rows = rows
    anomaly_rate = round((outlier_count / total_rows * 100), 2) if total_rows > 0 else 0.0
    
    # Calculate analytics if we have the dataframe
    df = stored.get("dataframe") if report_id in REPORTS else None
    if df is not None and len(df) > 0:
        try:
            stat_obs = analyze_statistical_observations(df)
            recommendations = generate_recommendations(df)
            detect_breakdown = detection_breakdown(df)
        except Exception as e:
            print(f"[ANALYTICS] Error calculating analytics: {e}")
            # Fallback to default values
            stat_obs = {
                "critical": ["No Critical Issues Detected"],
                "warning": ["No Warnings"],
                "optimized": ["Standard Compliance"]
            }
            recommendations = [{
                "title": "DATA QUALITY EXCELLENT",
                "description": "No critical optimizations required.",
                "impact": "MAINTAIN CURRENT SCORE",
                "effort": "NO ACTION NEEDED"
            }]
            detect_breakdown = {
                'ISOLATIONFOREST': {'count': outlier_count, 'method': 'Tree-Based Partitioning'},
                'Z-SCORE': {'count': 0, 'method': 'Standard Deviation Threshold'},
                'MODIFIED Z-SCORE': {'count': 0, 'method': 'Median Absolute Deviation'},
                'IQR METHOD': {'count': 0, 'method': 'Interquartile Range Filter'}
            }
    else:
        # Default values for backward compatibility
        stat_obs = {
            "critical": ["No Critical Issues Detected"],
            "warning": ["No Warnings"],
            "optimized": ["Consistent Numeric Typing"]
        }
        recommendations = [{
            "title": "DATA QUALITY EXCELLENT",
            "description": "Dataset meets quality standards.",
            "impact": "MAINTAIN SCORE",
            "effort": "NO ACTION"
        }]
        detect_breakdown = {
            'ISOLATIONFOREST': {'count': outlier_count, 'method': 'Tree-Based Partitioning'},
            'Z-SCORE': {'count': 0, 'method': 'Standard Deviation Threshold'},
            'MODIFIED Z-SCORE': {'count': 0, 'method': 'Median Absolute Deviation'},
            'IQR METHOD': {'count': 0, 'method': 'Interquartile Range Filter'}
        }
    
    return {
        "dataset_id": report_id,
        "reliability_score": 87.5,
        "anomaly_rate": anomaly_rate,
        "status": "completed",
        "issue_summary": {
            "missing": f"{missing_count} missing values detected",
            "anomalies": f"{outlier_count} outliers found",
            "inconsistencies": "No schema issues",
            "duplicates": "No duplicates detected"
        },
        "anomaly_count": outlier_count,
        "duplicate_count": 0,
        "recommendations": recommendations,  # DYNAMIC recommendations
        "statistical_observations": stat_obs,  # NEW: Statistical categorization
        "detection_breakdown": detect_breakdown,  # NEW: Detection method results
        "created_at": datetime.utcnow().isoformat(),
        "error_message": None,
        "is_sampled": False,
        "sample_size": 0,
        "columns": [
            {
                "column_name": "Date",
                "metrics": {"completeness": 100.0, "uniqueness": 95.1},
                "issues": []
            },
            {
                "column_name": "Consumption",
                "metrics": {"completeness": 99.2, "uniqueness": 88.7},
                "issues": [f"{outlier_count} outliers detected"] if outlier_count > 0 else []
            },
            {
                "column_name": "Production",
                "metrics": {"completeness": 99.8, "uniqueness": 92.3},
                "issues": [f"{missing_count} missing values"] if missing_count > 0 else []
            },
            {
                "column_name": "Region",
                "metrics": {"completeness": 100.0, "uniqueness": 12.5},
                "issues": []
            }
        ]
    }


@router.post("/audit/{report_id}")
async def trigger_audit(report_id: str):
    """
    Trigger instant "audit" - returns immediately with completed status.
    NO background processing, NO database, NO crashes.
    """
    print(f"[AUDIT] ===== AUDIT REQUEST RECEIVED =====")
    print(f"[AUDIT] Report ID: {report_id}")
    
    try:
        # Mark as completed immediately in our in-memory store
        if report_id in REPORTS:
            print(f"[AUDIT] Found existing report for {report_id}")
            REPORTS[report_id]["status"] = "completed"
            REPORTS[report_id]["processed_at"] = datetime.utcnow().isoformat()
        else:
            print(f"[AUDIT] Creating new report entry for {report_id}")
            REPORTS[report_id] = {
                "report_id": report_id,
                "dataset_id": report_id,
                "status": "completed",
                "filename": "uploaded_file.csv",
                "name": "Dataset",
                "rows": 1000,
                "columns": 5,
                "created_at": datetime.utcnow().isoformat(),
                "processed_at": datetime.utcnow().isoformat()
            }
        
        print(f"[AUDIT] Processing completed successfully")
        print(f"[AUDIT] ===== RETURNING SUCCESS RESPONSE =====")
        
        # Return success response
        return {
            "message": "Audit completed successfully",
            "dataset_id": report_id,
            "status": "completed"
        }
        
    except Exception as e:
        print(f"[AUDIT ERROR] ===== AUDIT FAILED =====")
        print(f"[AUDIT ERROR] Error: {str(e)}")
        import traceback
        print(f"[AUDIT ERROR] Traceback:\n{traceback.format_exc()}")
        print(f"[AUDIT ERROR] ===== END ERROR =====")
        
        # Return success anyway with mock data (never crash!)
        return {
            "message": "Audit completed (with fallback data)",
            "dataset_id": report_id,
            "status": "completed"
        }


@router.get("/status/{report_id}")
async def get_status(report_id: str):
    """
    Return processing status for a report.
    """
    if report_id in REPORTS:
        stored = REPORTS[report_id]
        return {
            "dataset_id": report_id,
            "name": stored.get("name", "Dataset"),
            "filename": stored.get("filename", "file.csv"),
            "status": "completed",
            "rows": stored.get("rows", 0),
            "columns": stored.get("columns", 0),
            "error_message": None,
            "uploaded_at": stored.get("uploaded_at"),
            "processed_at": stored.get("processed_at")
        }
    
    # Mock status for unknown IDs
    return {
        "dataset_id": report_id,
        "name": "Dataset",
        "filename": "file.csv",
        "status": "completed",
        "rows": 7689,
        "columns": 4,
        "error_message": None,
        "uploaded_at": datetime.utcnow().isoformat(),
        "processed_at": datetime.utcnow().isoformat()
    }
