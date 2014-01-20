

class Node(object):
	def __init__(self, name):
		self.left = None
		self.right = None
		self.name = name

class Tree(object):
	def __init__(self):
		self.root = None

	def addNode(self, name):
		#internal use
		return Node(name)

	def insert(self, root, name):
		#external/internal call to add nodes
		if root == None:
			return self.addNode(name)
		else:
			if root.left == None:
				root.left = self.insert(root.left, name)
			else:
				root.right = self.insert(root.right, name)

			return root

	def build(self, root, path):
		#external/internal call to build from path
		index = 0
		if root == None:
			root = self.addNode(path[index])
			index += 1
		elif root.name == path[index]:
			index += 1
		elif root.name != path[index]:
			raise "More children needed"

		# index will always be 1 at this point
		if index < len(path):
			
			if path[index].find("|") > 0: #quick and dirty check
				if root.left == None and root.right == None:
					root.left = self.insert(root.left, path[index].split("|")[0])
					root.right = self.insert(root.right, path[index].split("|")[1])
				else:
					raise "dual insert attempted on non-leaf"
			# will only work for leaf nodes, 
			# and assumes dual insert is last thing on the path

			# if left doesn't exist, go down left
			elif root.left == None:
				root.left = self.build(root.left, path[index:])
			# if lefts exists, and is next step, go down left
			elif root.left.name == path[index]:
				self.build(root.left, path[index:])

			# if right doesn't exist go right
			elif root.right == None:
				root.right = self.build(root.right, path[index:])
			# if right is next step, go right
			elif root.right.name == path[index]:
				self.build(root.right, path[index:])



		return root


	def printTree(self, root):
		if root == None:
			pass
		else:
			self.printTree(root.left)
			print root.name
			self.printTree(root.right)


def SplitPath(path):
	parts = []
	
	parts = path.split("/")

	while "" in parts:
		parts.remove("")

	return parts


tree = Tree()
root = None
print "Building the tree"
root = tree.build(root, SplitPath("/home/sports/basketball/ncaa"))
root = tree.build(root, SplitPath("/home/sports/football"))
root = tree.build(root, SplitPath("/home/music/rap"))
root = tree.build(root, SplitPath("/home/music/rock"))
# depth-first, in-order binary tree output
tree.printTree(root)

print
print "Adding dual leaf-nodes"

root = tree.build(root, SplitPath("/home/sports/football/NFL|NCAA"))

tree.printTree(root)

""" OUTPUT 

C:\Users\Ben\Documents\GitHub\misc>2DualLeafInsert.py
Building the tree
ncaa
basketball
sports
football
home
rap
music
rock

"""