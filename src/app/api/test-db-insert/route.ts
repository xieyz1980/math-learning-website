import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 测试查询
    const { data: courses, error: coursesError } = await client
      .from('courses')
      .select('*')
      .limit(5);
    
    const { data: grades, error: gradesError } = await client
      .from('grades')
      .select('*')
      .limit(5);
    
    const { data: examPapers, error: examsError } = await client
      .from('exam_papers')
      .select('*')
      .limit(5);

    // 测试插入
    const testInsert = await client
      .from('courses')
      .insert({
        title: '测试课程-' + Date.now(),
        chapter: '测试章节',
        videoUrl: 'https://test.com',
        videoType: 'test',
        description: '这是一个测试',
        gradeId: grades && grades.length > 0 ? grades[0].id : null,
        versionId: null,
        createdBy: 'test',
      })
      .select()
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        coursesCount: courses?.length || 0,
        coursesError,
        gradesCount: grades?.length || 0,
        gradesError,
        examPapersCount: examPapers?.length || 0,
        examsError,
        testInsertSuccess: testInsert.data ? testInsert.data.length > 0 : false,
        testInsertError: testInsert.error,
        testInsertData: testInsert.data,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '测试失败',
      },
      { status: 500 }
    );
  }
}
