import java.applet.*;
import java.awt.*;
import javax.swing.*;
import java.awt.event.*;
import java.awt.image.*;
import java.awt.geom.*;

public class Field extends Thread implements Runnable
{
	private JApplet lid;
	private byte[][] jar = new byte[5][];
	private ImageLoader[] them = new ImageLoader[18];
	private ImageLoader il1, il2, il3, il4, il5;
	private Image[] yummies = new Image[6];
	private Image[] sides = new Image[8];
	private Color back = new Color(255, 153, 102);
	private Image target, targetL, image, background, ex, barEmpt, barFull;
	//private int i, j, k,
	private int s=0;
	private Graphics offscreen;
	private int REFRESH_RATE=100;
	private final int Jar_Top;
	private final int Jar_Left;
	private final int Jar_Space = 5;
	
	private boolean Locked = false;
	private boolean LockedIn = false;
	private boolean Wipeing = false;
	private byte targX = 2, targY=2;
	private int wid, anim=0, andic;
	private boolean clear;
	private boolean colLine, rowLine;
	private boolean[] skip = new boolean[10];
	private final byte GOOD = 7;
	private long score = 0;
	
	private boolean animation = false;
	
	public Field(JApplet that, int top, int left)
	{
		lid = that;
		Jar_Top = top;
		Jar_Left = left;
		
		jar[0] = new byte[5];
		jar[1] = new byte[5];
		jar[2] = new byte[5];
		jar[3] = new byte[5];
		jar[4] = new byte[5];
		
		
		for (int i=0;i<5;i++)
			for (int j=0;j<5;j++)
				jar[i][j] = (byte)(Math.random()*5);
	
		System.out.println("<<Loading...>>");
		
		them[0] = new ImageLoader(lid, "cookie1.gif", true);
		them[1] = new ImageLoader(lid, "cookie2.gif", true);
		them[2] = new ImageLoader(lid, "cookie3.gif", true);
		them[3] = new ImageLoader(lid, "cookie4.gif", true);
		them[4] = new ImageLoader(lid, "cookie5.gif", true);
		them[13] = new ImageLoader(lid, "Eli.gif", true);
		them[14] = new ImageLoader(lid, "Gavin.gif", true);
		them[15] = new ImageLoader(lid, "Paul.gif", true);
		them[16] = new ImageLoader(lid, "Ralph.gif", true);
		them[17] = new ImageLoader(lid, "Steve.gif", true);
		yummies[0] = them[0].getImage();
		yummies[1] = them[1].getImage();
		yummies[2] = them[2].getImage();
		yummies[3] = them[3].getImage();
		yummies[4] = them[4].getImage();
		yummies[5] = them[13].getImage();
		
		them[5] = new ImageLoader(lid, "cornerInTL.gif", true);
		them[6] = new ImageLoader(lid, "cornerInTR.gif", true);
		them[7] = new ImageLoader(lid, "cornerInBL.gif", true);
		them[8] = new ImageLoader(lid, "cornerInBR.gif", true);
		them[9] = new ImageLoader(lid, "sideT.gif", true);
		them[10] = new ImageLoader(lid, "sideR.gif", true);
		them[11] = new ImageLoader(lid, "sideB.gif", true);
		them[12] = new ImageLoader(lid, "sideL.gif", true);
		sides[0] = them[5].getImage();
		sides[1] = them[6].getImage();
		sides[2] = them[7].getImage();
		sides[3] = them[8].getImage();
		sides[4] = them[9].getImage();
		sides[5] = them[10].getImage();
		sides[6] = them[11].getImage();
		sides[7] = them[12].getImage();
		
		il1 = new ImageLoader(lid, "targ.gif", true);
		target = il1.getImage();
		il2 = new ImageLoader(lid, "targL.gif", true);
		targetL = il2.getImage();
		il3 = new ImageLoader(lid, "exed.gif", true);
		ex = il3.getImage();
		//il4 = new ImageLoader(lid, "barE.gif", true);
		//barEmpt = IL[1].getImage();
		//il5 = new ImageLoader(lid, "barF.gif", true);
		//barFull = IL[2].getImage();
		
		System.out.println("<<Loaded>>");
		
		wid = 25;
		
		
		
		System.out.println("<<Field Start>>");
	}
	public void Pressed (int e)
	{
		//System.out.println("Key pressed"+e);
		switch (e)
		{
			case 4:
				Locked = true;
				break;
			case 0:
			case 1:
			case 2:
			case 3:
				if(!Wipeing)
				{
					if(Locked)
					{
						if (!LockedIn)
						{
							LockedIn=true;
							anim=1;
							andic=(e);
						}
					}
					else
					{
						move(e);
					}
				}
				break;
			default:
				System.out.println(e+" ");
				break;
		}
	}
	public void Typed (int e)
	{
	}
	public void Released (int e)
	{
		switch (e)
		{
			case 4:
				Locked = false;
				break;
		}
	}
	public void paint(Graphics g)
	{
		
		//System.out.println("<<Field painting>>"+Locked+" "+(((targX*wid)-2)+(targX*Jar_Space)+(Jar_Left))+"x "+targY+"y");
		s++;
		if (!Locked && !LockedIn)
		{
			for (int i=0;i<jar.length;i++)
				for (int j=0;j<jar[0].length;j++)
				{
					g.drawImage(yummies[jar[i][j]%7], (Jar_Left + i*wid + i*Jar_Space), (Jar_Top + j*wid + j*Jar_Space), lid);
					if (jar[i][j] > 6) g.drawImage(ex, (Jar_Left + i*wid + i*Jar_Space), (Jar_Top + j*wid + j*Jar_Space), lid);
				}
			if((s>2) && (!Wipeing))
			{
				g.drawImage(target, ((targX*wid)+(targX*Jar_Space)+(Jar_Left)-(2)), ((targY*wid)+(targY*Jar_Space)+(Jar_Top)-(2)), lid);
				s=0;
			}
			s++;
		}
		else
		{
			for (int i=0;i<jar.length;i++)
				for (int j=0;j<jar[0].length;j++)
					if ((!animation) || (anim==0 || ((andic%2 == 1 && targX != i) || (andic%2 == 0 && targY != j))))
					{
						g.drawImage(yummies[jar[i][j]%7], (Jar_Left + i*wid + i*Jar_Space), (Jar_Top + j*wid + j*Jar_Space), lid);
						if (jar[i][j] > 6) g.drawImage(ex, (Jar_Left + i*wid + i*Jar_Space), (Jar_Top + j*wid + j*Jar_Space), lid);
					}
					else if (3*anim < 25)
					{
						if (andic % 2 == 1)
						{
							g.drawImage(yummies[jar[i][j]%7], (Jar_Left + i*wid + i*Jar_Space), (Jar_Top + j*wid + j*Jar_Space +((3*anim)*(((andic/2)*2)-1))), lid);
							if (j==5)
								g.drawImage(yummies[jar[((1-(andic/2))*4)][j]%7], (Jar_Left + i*wid + i*Jar_Space), (Jar_Top + ( ((1-(andic/2))*4)*wid ) + ( ((1-(andic/2))*4)*Jar_Space ) + ((3*(4-anim))*(((andic/2)*2)-1))), lid);
						}
						else
						{
							g.drawImage(yummies[jar[i][j]%7], (Jar_Left + i*wid + i*Jar_Space +((3*anim)*(((andic/2)*2)-1))), (Jar_Top + j*wid + j*Jar_Space), lid);
							if (i==5)
								g.drawImage(yummies[jar[i][((1-(andic/2))*4)]%7], (Jar_Left + ( ((1-(andic/2))*4)*wid ) + ( ((1-(andic/2))*4)*Jar_Space ) + ((3*anim)*(((andic/2)*2)-1))), (Jar_Top + j*wid + j*Jar_Space), lid);
						}
						anim++;
					}
								
			if((s>2) && (!Wipeing))
			{
				g.setColor(Color.GREEN);
				g.drawImage(targetL, ((targX*wid)+(targX*Jar_Space)+(Jar_Left)-(2)), ((targY*wid)+(targY*Jar_Space)+(Jar_Top)-(2)), lid);
				if (targX > 0)
					g.fillRect( (Jar_Left)+(5), (targY*wid)+(targY*Jar_Space)+(Jar_Top)+(10), (targX*wid)+(targX*Jar_Space)-(10), 5 );
				if (targY > 0)
					g.fillRect( ((targX)*wid)+((targX)*Jar_Space)+(Jar_Left)+(10), (Jar_Top)+(5), 5, (targY*wid)+(targY*Jar_Space)-(10) );
				if (targX < 4)
					g.fillRect( ((targX+1)*wid)+(targX*Jar_Space)+(Jar_Left), (targY*wid)+(targY*Jar_Space)+(Jar_Top)+(10), ((4-targX)*wid)+((4-targX)*Jar_Space)-(10), 5 );
				if (targY < 4)
					g.fillRect( ((targX)*wid)+((targX)*Jar_Space)+(Jar_Left)+(10), ((targY+1)*wid)+(targY*Jar_Space)+(Jar_Top), 5, ((4-targY)*wid)+((4-targY)*Jar_Space)-(10) );
				s=0;
			}
		}
		g.setColor(back);
		g.fillRect(Jar_Left-80, Jar_Top-80, (wid*5)+(Jar_Space*4)+(70*2)+20, 70);
		g.fillRect(Jar_Left-80, Jar_Top-10, 70, (wid*5)+(Jar_Space*4)+(70)+10);
		g.fillRect((Jar_Left)+(wid*5)+(Jar_Space*4)+(10), Jar_Top-10, 70, (wid*5)+(Jar_Space*4)+(70)+10);
		g.fillRect(Jar_Left-10, (Jar_Top)+(wid*5)+(Jar_Space*4)+(10), (wid*5)+(Jar_Space*4)+20, 60);
		for(int i=0; i<((5*wid)+(Jar_Space*5))/10;i++)
		{
			g.drawImage(sides[6], Jar_Left+(10*i), Jar_Top-10, lid);
			g.drawImage(sides[7], Jar_Left+(wid*5)+(Jar_Space*4), Jar_Top+(10*i), lid);
			g.drawImage(sides[4], Jar_Left+(10*i), Jar_Top+(wid*5)+(Jar_Space*4), lid);
			g.drawImage(sides[5], Jar_Left-10, Jar_Top+(10*i), lid);
		}
		g.drawImage(sides[0], Jar_Left-10, Jar_Top-10, lid);
		g.drawImage(sides[1], Jar_Left+(wid*5)+(Jar_Space*4), Jar_Top-10, lid);
		g.drawImage(sides[3], Jar_Left+(wid*5)+(Jar_Space*4), Jar_Top+(wid*5)+(Jar_Space*4), lid);
		g.drawImage(sides[2], Jar_Left-10, Jar_Top+(wid*5)+(Jar_Space*4), lid);
		
		/*
		for(int i=0;i<25;i++)
		{
			if (score+i > 24)
				g.drawImage(barFull, Jar_Left-20, (Jar_Top+wid*5+Jar_Space*4)-i*15), lid);
			else
				g.drawImage(barEmpt, Jar_Left-20, (Jar_Top+wid*5+Jar_Space*4)-i*15), lid);
		}
		*/
	}
		//255, 153, 102
	public void run()
	{
		while (true)
		{
			//System.out.println("<<Field Running>>");
			try
			{
				Thread.sleep (REFRESH_RATE);
			} catch (Exception e) {};
			if ((!animation && LockedIn) || (3*anim > 24))
			{
				byte temp = 0;
				switch (andic)
				{
					case 0:
						temp = jar[0][targY];
						jar[0][targY]=jar[1][targY];
						jar[1][targY]=jar[2][targY];
						jar[2][targY]=jar[3][targY];
						jar[3][targY]=jar[4][targY];
						jar[4][targY]=temp;
						break;
					case 1:
						temp = jar[targX][0];
						jar[targX][0]=jar[targX][1];
						jar[targX][1]=jar[targX][2];
						jar[targX][2]=jar[targX][3];
						jar[targX][3]=jar[targX][4];
						jar[targX][4]=temp;
						break;
					case 2:
						temp = jar[4][targY];
						jar[4][targY]=jar[3][targY];
						jar[3][targY]=jar[2][targY];
						jar[2][targY]=jar[1][targY];
						jar[1][targY]=jar[0][targY];
						jar[0][targY]=temp;
						break;
					case 3:
						temp = jar[targX][4];
						jar[targX][4]=jar[targX][3];
						jar[targX][3]=jar[targX][2];
						jar[targX][2]=jar[targX][1];
						jar[targX][1]=jar[targX][0];
						jar[targX][0]=temp;
						break;
				}
				anim=0;
				LockedIn=false;
				
				//check for line-up
				
				clear = true;
				colLine = true; rowLine = true;
				final byte SIEN = 10;
				for(int i=0;i<skip.length;i++)
					skip[i]=false;
				do
				{
					clear=true;
					//for (int a=0;a<5;a++) { for (int b=0;b<5;b++) System.out.print(""+jar[a][b]); System.out.println("");}
					for(int i=0;i<jar.length;i++)
					{
						byte memI=SIEN;
						byte memJ=SIEN;
						for(int j=0;j<jar[0].length;j++)
						{
						//System.out.print(i+"x"+j+" ");	
							
							if ((memI == SIEN) && (jar[i][j] < 7))
								memI=jar[i][j];
							else if ((jar[i][j] != memI) && (jar[i][j] < 7))
								colLine=false;
							if ((j==jar.length-1) && (memI==SIEN))
								colLine=false;
								
							if ((memJ == SIEN) && (jar[j][i] < 7))
								memJ=jar[j][i];
							else if ((jar[j][i] != memJ) && (jar[j][i] < 7))
								rowLine=false;
							if ((j==jar[0].length-1) && (memJ==SIEN))
								rowLine=false;
							
							//System.out.println(" I"+memI+":"+jar[i][j]+" J"+memJ+":"+jar[j][i]+" col:"+colLine+" row:"+rowLine);
							
						}
						if (colLine)
						{
							//System.out.println("column found "+(i));
							clear=false;
							skip[i]=true;
						}
						if (rowLine)
						{
							//System.out.println("row found "+(i+5));
							clear=false;
							skip[i+5]=true;
						}
						memI=SIEN;
						memJ=SIEN;
						colLine=true;
						rowLine=true;
					}
					if (!clear)
					{
						for(int i=0;i<skip.length;i++)
						{ 
							int j=0;
							try
							{
							
							if (skip[i] && i<5)
								for(j=0;j<jar.length;j++)
								{
									if (jar[i][j] < 7) // just for Debug, mabey take out later
										jar[i][j]+=GOOD;
								}
							else if (skip[i] && i>4)
								for(j=0;j<jar[0].length;j++)
								{
									if (jar[j][i%5] < 7) // Debug
										jar[j][i%5]+=GOOD;
								}
							skip[i]=false;
							} catch (Exception e){System.out.println("Balthazar "+i+" "+j);};
						}
						Wipeing = true;
						try
						{
							Thread.sleep (500);
						} catch (Exception e) {};
						score++;
						Wipeing = false;
						//System.out.println("wiped");
					}
				}while(!clear);
				
				for(int i=0;i<jar.length;i++)
					for(int j=0;j<jar[0].length;j++)
					{
						if ((i==0 || j==0 || i==4 || j==4) && jar[i][j] > 6)
						{
							jar[i][j] = (byte)(Math.random()*5);
						}
						if (i<2)
							if (jar[i+1][j] > 6 && jar[i][j] < 7)
							{
								jar[i+1][j] = jar[i][j];
								jar[i][j] = (byte)(Math.random()*5);
							}
						if (j<2)
							if (jar[i][j+1] > 6 && jar[i][j] < 7)
							{
								jar[i][j+1] = jar[i][j];
								jar[i][j] = (byte)(Math.random()*5);
							}
						if (i>1)
							if (jar[i-1][j] > 6 && jar[i][j] < 7)
							{
								jar[i-1][j] = jar[i][j];
								jar[i][j] = (byte)(Math.random()*5);
							}
						if (j>1)
							if (jar[i][j-1] > 6 && jar[i][j] < 7)
							{
								jar[i][j-1] = jar[i][j];
								jar[i][j] = (byte)(Math.random()*5);
							}
						
					}
						
					
			}// if shifted
			
		}// while(running)
	}// run()
	public void move (int direc)
	{
		//System.out.println(""+direc);
		switch (direc)
		{
			case 0:
				if (targX==0)
					targX=4;
				else
					targX--;
				break;
			case 1:
				if (targY==0)
					targY=4;
				else
					targY--;
				break;
			case 2:
				if (targX==4)
					targX=0;
				else
					targX++;
				break;
			case 3:
				if (targY==4)
					targY=0;
				else
					targY++;
				break;
		}
	}
	public void clearScore()
	{
		score=0;
	}
	public long getScore()
	{
		return score;
	}
}